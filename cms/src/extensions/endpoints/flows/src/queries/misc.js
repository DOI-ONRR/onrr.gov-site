import { gql } from 'graphql-request'

export function getCreateMutation(collection) {
    return gql`
    mutation create_${collection}_item($data: create_${collection}_input!) {
        create_${collection}_item(data: $data) {
            id
        }
    }`;
}