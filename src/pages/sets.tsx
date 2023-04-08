import * as React from "react";
import type { HeadFC, PageProps } from "gatsby";
import { graphql, Link } from "gatsby";

export const query = graphql`
  query setQuery {
    allSets(sort: { released_at: DESC }) {
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
  return (
    <main>
      <ul>
        {sets.map((set) => (
          <li key={set.node.code}>
            {set.node.name}{" "}
            <Link to={`/set/${set.node.code}`}>Non-foil cards</Link>{" "}
            <Link to={`/set/${set.node.code}/foil`}>Foil cards</Link>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default IndexPage;

export const Head: HeadFC = () => <title>Home Page</title>;
