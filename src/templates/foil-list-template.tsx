import React from "react";
import { graphql } from "gatsby";
import type { Card } from "../components/card-grid";
import { CardGrid } from "../components/card-grid";

const NonFoilCardList: React.FC<{
  data: {
    allCards: {
      edges: {
        node: {
          name: string;
          foilPrice: {
            price: number;
            url: string;
          };
          foil: boolean;
          image_uris: {
            normal: string;
          };
        };
      }[];
    };
  };
}> = (props) => {
  console.log(props);
  const cards = props.data.allCards.edges
    .filter((card) => card.node.foil)
    .map(
      ({ node: card }): Card => ({
        price: card.foilPrice.price,
        cardmarket_url: card.foilPrice.url,
        name: card.name,
        image: card.image_uris.normal,
      })
    );
  return <CardGrid cards={cards} />;
};

export default NonFoilCardList;

export const nonFoilQuery = graphql`
  query MyQuery($set: String) {
    allCards(
      filter: {
        set: { code: { eq: $set } }
        foilPrice: { price: { ne: null } }
      }
      sort: { foilPrice: { price: DESC } }
    ) {
      edges {
        node {
          name
          foilPrice {
            price
            url
          }
          foil
          image_uris {
            normal
          }
        }
      }
    }
    sets(code: { eq: $set }) {
      code
    }
  }
`;
