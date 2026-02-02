export { arrayTypeData } from "./array-type";
export { consistentGenericConstructorsData } from "./consistent-generic-constructors";
export { consistentIndexedObjectStyleData } from "./consistent-indexed-object-style";
export { consistentTypeDefinitionsData } from "./consistent-type-definitions";
export { consistentTypeImportsData } from "./consistent-type-imports";
export { twoVsFourSpacesData } from "./2-spaces-vs-4-spaces";
export { funcStyleData } from "./func-style";
export { namedVsDefaultExportsData } from "./named-vs-default-exports";
export { semicolonsData } from "./semicolons";
export { singleVsDoubleQuotesData } from "./single-vs-double-quotes";
export { spacesVsTabsData } from "./spaces-vs-tabs";

import { arrayTypeData } from "./array-type";
import { consistentGenericConstructorsData } from "./consistent-generic-constructors";
import { consistentIndexedObjectStyleData } from "./consistent-indexed-object-style";
import { consistentTypeDefinitionsData } from "./consistent-type-definitions";
import { consistentTypeImportsData } from "./consistent-type-imports";
import { twoVsFourSpacesData } from "./2-spaces-vs-4-spaces";
import { funcStyleData } from "./func-style";
import { namedVsDefaultExportsData } from "./named-vs-default-exports";
import { semicolonsData } from "./semicolons";
import { singleVsDoubleQuotesData } from "./single-vs-double-quotes";
import { spacesVsTabsData } from "./spaces-vs-tabs";

export const allComparisons = [
  spacesVsTabsData,
  semicolonsData,
  funcStyleData,
  twoVsFourSpacesData,
  arrayTypeData,
  consistentTypeDefinitionsData,
  consistentTypeImportsData,
  consistentIndexedObjectStyleData,
  consistentGenericConstructorsData,
  namedVsDefaultExportsData,
  singleVsDoubleQuotesData,
];
