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
          nonfoilPrice: {
            price: number;
            url: string;
          };
          image_uris: {
            normal: string;
          };
        };
      }[];
    };
  };
}> = (props) => {
  const cards = props.data.allCards.edges.map(
    ({ node: card }): Card => ({
      price: card.nonfoilPrice.price,
      cardmarket_url: card.nonfoilPrice.url,
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
        nonfoilPrice: { price: { ne: null } }
      }
      sort: { nonfoilPrice: { price: DESC } }
    ) {
      edges {
        node {
          name
          nonfoilPrice {
            price
            url
          }
          image_uris {
            normal
          }
        }
      }
    }
  }
`;
