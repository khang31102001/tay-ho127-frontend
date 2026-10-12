export { NavigationMenusExplorer } from "./components/NavigationMenusExplorer";
export { NavigationMenuEditor } from "./components/NavigationMenuEditor";
export { NavigationTree } from "./components/NavigationTree";
export { NavigationItemEditor } from "./components/NavigationItemEditor";
export { NavigationRenderer, type NavigationRendererVariant } from "./components/NavigationRenderer";

export { useAdminSidebarMenu } from "./hooks/useAdminSidebarMenu";

export {
  NAVIGATION_LOCATION_OPTIONS,
  NAVIGATION_TARGET_TYPE_OPTIONS,
} from "./types/navigation.types";
export type {
  AdminMenuTreeNode,
  NavigationLocation,
  NavigationScope,
  NavigationTargetType,
  NavigationItem,
  ManagedNavigationItem,
  ManagedNavigationMenu,
} from "./types/navigation.types";

export { resolveNavigationLinkProps } from "./utils/navigation-tree";
export { NAVIGATION_ICON_NAMES, resolveNavigationIcon } from "./utils/icon-registry";
