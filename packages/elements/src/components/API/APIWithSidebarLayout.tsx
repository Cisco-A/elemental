import {
  ExportButtonProps,
  Logo,
  ParsedDocs,
  PoweredByLink,
  SidebarLayout,
  TableOfContents,
} from '@jpmorganchase/elemental-core';
import { Flex, Heading } from '@stoplight/mosaic';
import { NodeType } from '@stoplight/types';
import * as React from 'react';
import { Link, Redirect, useLocation } from 'react-router-dom';

import { ServiceNode } from '../../utils/oas/types';
import { computeAPITree, findFirstNodeSlug, isInternal } from './utils';

type SidebarLayoutProps = {
  serviceNode: ServiceNode;
  logo?: string;
  hideTryIt?: boolean;
  hideSchemas?: boolean;
  hideInternal?: boolean;
  hideExport?: boolean;
  hideInlineExamples?: boolean;
  exportProps?: ExportButtonProps;
  tryItCredentialsPolicy?: 'omit' | 'include' | 'same-origin';
  tryItCorsProxy?: string;
  tryItOutDefaultServer?: string;
  useCustomNav?: boolean;
};

export const APIWithSidebarLayout: React.FC<SidebarLayoutProps> = ({
  serviceNode,
  logo,
  hideTryIt,
  hideSchemas,
  hideInternal,
  hideExport,
  hideInlineExamples = false,
  exportProps,
  tryItCredentialsPolicy,
  tryItCorsProxy,
  tryItOutDefaultServer,
  useCustomNav,
}) => {
  const container = React.useRef<HTMLDivElement>(null);

  const tree = React.useMemo(() => {
    if (!useCustomNav) return computeAPITree(serviceNode, { hideSchemas, hideInternal });
    else return [];
  }, [serviceNode, hideSchemas, hideInternal, useCustomNav]);

  const location = useLocation();
  const { pathname } = location;
  const isRootPath = !pathname || pathname === '/';
  const node = isRootPath ? serviceNode : serviceNode.children.find(child => child.uri === pathname);

  React.useEffect(() => {
    // This is here to trick elements into reloading everytime the url changes so that we can use own sideabar
  }, [pathname]);

  const layoutOptions = React.useMemo(
    () => ({ hideTryIt: hideTryIt, hideInlineExamples, hideExport: hideExport || node?.type !== NodeType.HttpService }),
    [hideTryIt, hideExport, node, hideInlineExamples],
  );

  if (!node) {
    // Redirect to the first child if node doesn't exist
    const firstSlug = findFirstNodeSlug(tree);

    if (firstSlug) {
      return <Redirect to={firstSlug} />;
    }
  }

  if (hideInternal && node && isInternal(node)) {
    return <Redirect to="/" />;
  }

  const handleTocClick = () => {
    if (container.current) {
      container.current.scrollIntoView();
    }
  };

  const sidebar = (
    <>
      <Flex ml={4} mb={5} alignItems="center">
        {logo ? (
          <Logo logo={{ url: logo, altText: 'logo' }} />
        ) : (
          serviceNode.data.logo && <Logo logo={serviceNode.data.logo} />
        )}
        <Heading size={4}>{serviceNode.name}</Heading>
      </Flex>
      <Flex flexGrow flexShrink overflowY="auto" direction="col">
        <TableOfContents tree={tree} activeId={pathname} Link={Link} onLinkClick={handleTocClick} />
      </Flex>
      <PoweredByLink source={serviceNode.name} pathname={pathname} packageType="elements" />
    </>
  );

  return (
    <SidebarLayout ref={container} sidebar={sidebar} renderSideBar={!useCustomNav}>
      {node && (
        <ParsedDocs
          key={pathname}
          uri={pathname}
          node={node}
          nodeTitle={node.name}
          layoutOptions={layoutOptions}
          location={location}
          exportProps={exportProps}
          tryItCredentialsPolicy={tryItCredentialsPolicy}
          tryItCorsProxy={tryItCorsProxy}
          tryItOutDefaultServer={tryItOutDefaultServer}
        />
      )}
    </SidebarLayout>
  );
};
