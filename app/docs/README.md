# 文档中心

这是我们的文档中心，提供了关于我们产品的详细信息、使用指南和 API 参考。

## 内容结构

- **首页**: 文档中心概览
- **入门指南**: 快速上手使用我们的产品
- **API 参考**: 详细的 API 文档
- **示例**: 各种使用场景的示例代码

## DocSearch 集成

本文档中心已集成 [Algolia DocSearch](https://docsearch.algolia.com/)，为用户提供强大的文档搜索体验。

### 配置说明

为了使 DocSearch 能够正确抓取我们的文档内容，我们已经：

1. 添加了必要的 CSS 类

   - 主要内容区域添加了 `DocSearch-content` 类
   - 标题元素添加了唯一的 ID 属性

2. 设置了元数据标签

   - `docsearch:language`: zh-CN
   - `docsearch:version`: 1.0.0

3. 创建了网站地图 (sitemap.xml)

### 本地开发

如需在本地调试 DocSearch 功能，请按照以下步骤操作：

1. 安装依赖

   ```bash
   npm install @docsearch/react @docsearch/css
   ```

2. 配置 DocSearch 客户端

   ```jsx
   import { DocSearch } from "@docsearch/react";
   import "@docsearch/css";

   <DocSearch
     appId="YOUR_APP_ID"
     indexName="YOUR_INDEX_NAME"
     apiKey="YOUR_SEARCH_API_KEY"
   />;
   ```

## 贡献指南

如需向文档中心贡献内容，请遵循以下规则：

1. 所有文档页面应包含有意义的标题，并添加唯一 ID
2. 使用适当的标题层级 (h1, h2, h3, ...)
3. 代码示例应使用代码块格式
4. 保持内容的一致性和准确性

## 技术栈

- Next.js
- React
- TailwindCSS
- Algolia DocSearch
