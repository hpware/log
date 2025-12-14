import type {
  auth_schema,
  main_schema,
} from "../../../../../../packages/db/src";

type getUserInfoType = typeof auth_schema.user.$inferSelect;
type collectionsType = typeof main_schema.collections.$inferSelect;

export default function Client({
  data,
}: {
  data: {
    userInfo: {
      id: getUserInfoType["id"];
      name: getUserInfoType["name"];
      image: getUserInfoType["image"];
    };
    slug: collectionsType["id"];
    title: collectionsType["title"];
    createdAt: collectionsType["createdAt"];
    updatedAt: collectionsType["updatedAt"];
  };
}) {
  return (
    <div>
      <span>{data.title}</span>
    </div>
  );
}
