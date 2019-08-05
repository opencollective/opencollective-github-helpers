import fs from "fs";
import * as git from "isomorphic-git";

// Init git
git.plugins.set("fs", fs);

export default git;
