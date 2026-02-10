import { parseAsInteger, parseAsString } from "nuqs/server";
import { PAGINATION } from "@/config/constants";

export const credentialsParams = {
    page: parseAsInteger
        .withDefault(PAGINATION.DEAFULT_PAGE)
        .withOptions({ clearOnDefault:true}),
    pageSize: parseAsInteger
        .withDefault(PAGINATION.DEFAULT_PAGE_SIZE)
        .withOptions({ clearOnDefault:true}),
    search: parseAsString
        .withDefault("")
        .withOptions({ clearOnDefault:true}),
    
}