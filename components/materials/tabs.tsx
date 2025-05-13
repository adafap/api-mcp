import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const TabsComponent = ({ children, ...props }: any) => (
  <Tabs {...props}>{children}</Tabs>
);

export const TabsContentComponent = ({ children, ...props }: any) => (
  <TabsContent {...props}>{children}</TabsContent>
);

export const TabsListComponent = ({ children, ...props }: any) => (
  <TabsList {...props}>{children}</TabsList>
);

export const TabsTriggerComponent = ({ children, ...props }: any) => (
  <TabsTrigger {...props}>{children}</TabsTrigger>
);
