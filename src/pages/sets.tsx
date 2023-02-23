import * as React from "react";
import type { HeadFC, PageProps } from "gatsby";
import { graphql } from "gatsby";

export const query = graphql`
  query setQuery {
    allSets {
      edges {
        node {
          code
          name
        }
      }
    }
  }
`;

const IndexPage: React.FC<PageProps> = ({
  data,
}: PageProps<Queries.setQuery>) => {
  const sets = data.allSets.edges;
  console.log(sets[0]);
  return (
    <main>
      <ul>
        {sets.map((set) => (
          <li key={set.node.code}>{set.node.name}</li>
        ))}
      </ul>
    </main>
  );
};

export default IndexPage;

export const Head: HeadFC = () => <title>Home Page</title>;
