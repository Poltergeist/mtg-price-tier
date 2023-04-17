import React from "react";
import styled from "styled-components";

const columns = {
  small: 3,
  normal: 4,
  big: 8,
  biggest: 10,
};

const displaySize = {
  normal: "512px",
  big: "1048px",
  biggest: "1800px",
};

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${columns.small}, 1fr);
  grid-gap: 5px;
  @media (min-width: ${displaySize.normal}) {
    grid-template-columns: repeat(${columns.normal}, 1fr);
  }
  @media (min-width: ${displaySize.big}) {
    grid-template-columns: repeat(${columns.big}, 1fr);
  }
`;

const H2 = styled.h2`
  text-align: center;
  grid-column: span ${columns.small};
  @media (min-width: ${displaySize.normal}) {
    grid-column: span ${columns.normal};
  }
  @media (min-width: ${displaySize.big}) {
    grid-column: span ${columns.big};
  }
  &:before {
    content: "<===== ";
  }
  &:after {
    content: " =====>";
  }
`;

const Img = styled.img`
  max-width: 100%;
`;

export type Card = {
  price: number;
  cardmarket_url: string;
  name: string;
  image: string;
  promo_type: string[];
};
export type CardGridProps = {
  cards: Card[];
};

export const CardGrid = (props: CardGridProps) => {
  let price: number = 200000;
  return (
    <Grid>
      {props.cards.map((card: Card, index: number) => {
        const name = card.name;
        let header = null;
        if (card.price < price) {
          price = Math.floor(card.price);
          header = <H2>{price} Euro</H2>;
        }
        return (
          <React.Fragment key={index}>
            {header}
            <div key={name}>
              <a href={card.cardmarket_url} target="_blank">
                <Img src={card.image} />
              </a>
              {card.promo_type?.includes("halofoil") ? (
                <div>Halo Foil</div>
              ) : null}
            </div>
          </React.Fragment>
        );
      })}
    </Grid>
  );
};
