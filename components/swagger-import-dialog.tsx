'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface SwaggerImportDialogProps {
  onImport: (swaggerUrl: string, baseUrl: string) => Promise<void>;
}

export function SwaggerImportDialog({ onImport }: SwaggerImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [swaggerUrl, setSwaggerUrl] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleImport = async () => {
    if (!swaggerUrl.trim()) {
      toast.error('请输入Swagger文档地址');
      return;
    }

    if (!baseUrl.trim()) {
      toast.error('请输入API服务器地址');
      return;
    }

    setIsLoading(true);
    try {
      await onImport(swaggerUrl, baseUrl);
      setOpen(false);
      toast.success('Swagger文档导入成功');
    } catch (error) {
      toast.error(`导入失败: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">导入Swagger</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>导入Swagger文档</DialogTitle>
          <DialogDescription>
            输入Swagger文档地址和API服务器地址，导入后将自动解析API接口
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="swagger-url" className="text-right">
              Swagger地址
            </Label>
            <Input
              id="swagger-url"
              placeholder="https://example.com/swagger.json"
              className="col-span-3"
              value={swaggerUrl}
              onChange={(e) => setSwaggerUrl(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="base-url" className="text-right">
              服务器地址
            </Label>
            <Input
              id="base-url"
              placeholder="https://api.example.com"
              className="col-span-3"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleImport} disabled={isLoading}>
            {isLoading ? '导入中...' : '导入'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
