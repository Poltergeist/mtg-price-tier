import path from "path";
import fetch from "node-fetch";
import fs from "fs";
import type { GatsbyNode } from "gatsby";

type scryfallResponse = {
  has_more: boolean;
  data: card[];
};

type card = {
  name: string;
  set: string;
  collector_number: number;
};

type price = {
  set: string;
  price: string;
  foil: "yes" | "no";
  cn: string;
  name: string;
  url: string;
};

const setsValidation: {
  [setname: string]: {
    [key: number]: string;
  };
} = {};

async function fetchPaginatedResult(
  url: string,
  page: number = 1,
  previousResponse: card[] = []
): Promise<card[]> {
  return fetch(`${url}&page=${page}`)
    .then((response) => response.json())
    .then((newResponse: scryfallResponse) => {
      const response: card[] = [...previousResponse, ...newResponse.data];

      if (newResponse.has_more) {
        page++;

        return fetchPaginatedResult(url, page, response);
      }

      return response;
    });
}

export const sourceNodes: GatsbyNode["sourceNodes"] = async ({
  actions,
  createNodeId,
  createContentDigest,
}) => {
  const { createNode } = actions;

  const sets = ["one", "onc", "dmr", "snc", "ncc", "dmu", "mom", "mul", "moc"];

  await Promise.all(
    sets.map(async (set) => {
      setsValidation[set] = {};
      const result = await fetch(`https://api.scryfall.com/sets/${set}`)
        .then((result) => result.json())
        .then((result) => result);

      createNode({
        ...result,
        parent: null,
        children: [],
        internal: {
          type: `Sets`,
          mediaType: `text/html`,
          content: JSON.stringify(result),
          contentDigest: createContentDigest(result),
        },
      });

      const cards = await fetchPaginatedResult(result.search_uri);

      return cards.forEach((card) => {
        setsValidation[set][card.collector_number] = card.name;
        createNode({
          ...card,
          foilPrice: `${card.set}${card.collector_number}true`,
          nonfoilPrice: `${card.set}${card.collector_number}false`,
          id: createNodeId(`cards-${card.set}-${card.collector_number}`),
          parent: null,
          children: [],
          internal: {
            type: `Cards`,
            mediaType: `text/html`,
            content: JSON.stringify(card),
            contentDigest: createContentDigest(card),
          },
        });
      });
    })
  );

  sets.forEach((set) => {
    // const prices = require(`./${set}-output.json`);
    const prices = JSON.parse(fs.readFileSync(`./${set}-output.json`));

    prices
      .filter(
        (price: price) =>
          setsValidation[price.set][price.cn] === price.name &&
          price.price !== "NaN"
      )
      .forEach((price: price) => {
        createNode({
          ...price,
          price: parseFloat(price.price),
          foil: price.foil === "yes",
          priceCode: `${price.set}${price.cn}${price.foil === "yes"}`,
          id: createNodeId(
            `price-${price.set}${price.cn}${price.foil === "yes"}`
          ),
          parent: null,
          children: [],
          internal: {
            type: `Prices`,
            mediaType: `text/html`,
            content: JSON.stringify(price),
            contentDigest: createContentDigest(price),
          },
        });
      });
  });
};

export const createPages: GatsbyNode["createPages"] = async ({
  graphql,
  actions,
  reporter,
}) => {
  const { createPage } = actions;

  const result = await graphql(
    `
      query SetQuery {
        allSets {
          edges {
            node {
              code
            }
          }
        }
      }
    `
  );

  if (result.errors) {
    reporter.panicOnBuild(`Error while running GraphQL query.`);
    return;
  }

  result.data.allSets.edges.forEach((set) => {
    createPage({
      path: `/set/${set.node.code}`,
      component: path.resolve("./src/templates/non-foil-list-template.tsx"),
      context: {
        set: set.node.code,
      },
    });
    createPage({
      path: `/set/${set.node.code}/foil`,
      component: path.resolve("./src/templates/foil-list-template.tsx"),
      context: {
        set: set.node.code,
      },
    });
  });
};

export const createSchemaCustomization: GatsbyNode["createSchemaCustomization"] =
  ({ actions }) => {
    const { createTypes } = actions;
    const typeDefs = `
    type Cards implements Node {
      set: Sets @link(by: "code")
      foilPrice: Prices @link(by: "priceCode")
      nonfoilPrice: Prices @link(by: "priceCode")
    }

    type Sets implements Node {
      cards: [Cards] @link(by: "set.id", from: "id")
    }

  `;

    createTypes(typeDefs);
  };
