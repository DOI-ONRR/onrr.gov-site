## Tracking Configuration

### Flows

`flows.json` contains the configurations for _all_ flows defined. Anytime a flow or its operations changes, run the following GraphQL query against the source CMS instance and overwrite `flows.json` with the response. Use a GraphQL client such as Postman or the GraphiQL extension for Chrome.

```
query Flows {
    flows(sort: "-date_created", limit: -1) {
        id
        name
        icon
        color
        description
        status
        trigger
        accountability
        options
        date_created
        operation {
            id
            name
            key
            type
            position_x
            position_y
            options
            date_created
        }
    }
}

```

This query needs to be run against the `/graphql/system` endpoint of the source CMS. This endpoint requires a Bearer authorization token that can be retrieved by running `cf env <app name>`. The value is stored in the `DIRECTUS_EXTENSION_FLOWS_LOCAL_AUTH_TOKEN` variable.


## Updating operations
Below is guidance for using the Directus APIs to update operations.

1. Using the endpoint `/graphql/system`, use Postman to retrieve the operation or operations you wish to update.
   ```
   query Operations($ids: [String!]!) {
     operations(filter: { id: { _in: $ids } }, limit: -1) {
       name
       key
       type
       position_x
       position_y
       options
    }
   }
   ```
2. Provide each operations as the parameter to the following mutation, run at `/graphql/system` of the **upstream** CMS.
   ```
   mutation Update_operations_item($id: ID!, $item: update_directus_operations_input!) {
     update_operations_item(id: $id, data: $item) {
       name
       key
       type
       position_x
       position_y
       options
     }
   }
   ```
   Note: you will have to provide an authorization token as described in the section above.