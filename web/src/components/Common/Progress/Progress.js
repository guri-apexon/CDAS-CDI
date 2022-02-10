import React from "react";
import ApolloProgress from "apollo-react/components/ApolloProgress";
import Grid from "apollo-react/components/Grid";
import DataVizCard from "apollo-react/components/DataVizCard";

export default function Progress() {
  return (
    <div>
      <Grid container>
        <Grid item xs>
          <DataVizCard title="">
            <ApolloProgress />
          </DataVizCard>
        </Grid>
      </Grid>
    </div>
  );
}
