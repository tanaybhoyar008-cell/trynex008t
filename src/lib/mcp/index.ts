import { defineMcp } from "@lovable.dev/mcp-js";
import listPublicVideos from "./tools/list-public-videos";
import getVideo from "./tools/get-video";
import listCreators from "./tools/list-creators";

export default defineMcp({
  name: "texon-mcp",
  title: "Texon MCP",
  version: "0.1.0",
  instructions:
    "Read-only tools for the Texon entertainment app. Use `list_public_videos` to browse recent public videos, `get_video` to fetch a single video by id, and `list_creators` to search creator profiles.",
  tools: [listPublicVideos, getVideo, listCreators],
});
