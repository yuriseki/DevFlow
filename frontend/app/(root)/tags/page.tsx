import { getTags } from "@/lib/actions/tag.actions";
import React from "react";

const Tags = async () => {
  const { success, data, error } = await getTags({
    page: 1,
    pageSize: 10,
    query: "",
  })

  const { tags } = data || {};

  console.log(tags)

  return <div>Tags</div>;
};
export default Tags;
