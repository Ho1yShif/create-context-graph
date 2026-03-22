import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    'intro',
    {
      type: 'category',
      label: 'Tutorials',
      items: [
        'tutorials/first-context-graph-app',
        'tutorials/customizing-domain-ontology',
      ],
    },
    {
      type: 'category',
      label: 'How-To Guides',
      items: [
        'how-to/import-saas-data',
        'how-to/add-custom-domain',
        'how-to/switch-agent-frameworks',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'reference/cli-options',
        'reference/ontology-yaml-schema',
        'reference/generated-project-structure',
      ],
    },
    {
      type: 'category',
      label: 'Explanation',
      items: [
        'explanation/how-domain-ontologies-work',
        'explanation/three-memory-types',
      ],
    },
  ],
};

export default sidebars;
