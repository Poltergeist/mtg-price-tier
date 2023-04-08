import React from "react";
import { graphql, Link, PageProps } from "gatsby";
import type { Card } from "../components/card-grid";
import { CardGrid } from "../components/card-grid";

const FoilCardList: React.FC<{
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
}> = (props: PageProps<Queries.cardFoilQuery>) => {
  const cards = props.data.allCards.edges
    .filter((card) => card.node.foil)
    .map(
      ({ node: card }): Card => ({
        price: card.foilPrice.price,
        cardmarket_url: card.foilPrice.url,
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
          <Link to={props.path.replace("/foil/", "")}>Non-Foil cards</Link>
        </li>
      </ul>
      <CardGrid cards={cards} />
    </>
  );
};

export default FoilCardList;

export const foilQuery = graphql`
  query cardFoil($set: String) {
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
          card_faces {
            image_uris {
              normal
            }
          }
        }
      }
    }
    sets(code: { eq: $set }) {
      code
    }
  }
`;
