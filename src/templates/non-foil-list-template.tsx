import React from "react";
import { graphql, Link, PageProps } from "gatsby";
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
          nonfoil: boolean;
          image_uris: {
            normal: string;
          } | null;
          card_faces: {
            image_uris:
              | {
                  normal: string;
                }[]
              | null;
          };
        };
      }[];
    };
  };
}> = (props: PageProps<Queries.cardNonFoilQuery>) => {
  const cards = props.data.allCards.edges
    .filter((card) => card.node.nonfoil)
    .map(
      ({ node: card }): Card => ({
        price: card.nonfoilPrice.price,
        cardmarket_url: card.nonfoilPrice.url,
        name: card.name,
        image: card.image_uris?.normal || card.card_faces[0].image_uris.normal,
      })
    );
  return (
    <>
      <ul>
        <li>
          <Link to="/sets">Set Overview</Link>
        </li>
        <li>
          <Link to={props.path + "foil"}>Foil Cards</Link>
        </li>
      </ul>
      <CardGrid cards={cards} />
    </>
  );
};

export default NonFoilCardList;

export const nonFoilQuery = graphql`
  query cardNonFoil($set: String) {
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
          nonfoil
          image_uris {
            normal
          }
          card_faces {
            image_uris {
              normal
            }
          }
        }
      }
    }
  }
`;
