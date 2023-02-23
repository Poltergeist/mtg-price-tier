import fetch from "node-fetch";
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
};

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

  const sets = ["one"];

  await Promise.all(
    sets.map(async (set) => {
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
      console.log("set created");

      const cards = await fetchPaginatedResult(result.search_uri);

      return cards.forEach((card) => {
        createNode({
          ...card,
          foilPrice: `${card.set}${card.collector_number}true`,
          nonfoilPrice: `${card.set}${card.collector_number}false`,
          id: createNodeId(`cards-${card.collector_number}`),
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

  const prices = require("./one-output.json");

  prices.forEach((price: price) => {
    if (price.price === "NaN") {
      return;
    }
    createNode({
      ...price,
      price: parseFloat(price.price),
      foil: price.foil === "yes",
      priceCode: `${price.set}${price.cn}${price.foil === "yes"}`,
      id: createNodeId(`price-${price.set}${price.cn}${price.foil === "yes"}`),
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
