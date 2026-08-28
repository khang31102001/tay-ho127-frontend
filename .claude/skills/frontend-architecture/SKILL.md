---
name: frontend-architecture

description: >
  Audit, redesign, refactor và bảo vệ kiến trúc Frontend cho Next.js,
  React và TypeScript. Skill được thiết kế cho các hệ thống có cả
  Customer/User UI và Admin Portal trong cùng một Next.js application,
  kết nối Backend REST API.

  Sử dụng skill khi cần scan toàn bộ repository, đánh giá architecture,
  chuẩn hóa folder structure, feature boundary, component ownership,
  API integration, state management, Server/Client Component boundary,
  authentication, authorization, naming convention, dependency direction,
  dead code và technical debt.

  Mục tiêu là tạo codebase modular, dễ hiểu, dễ bảo trì, dễ mở rộng,
  có thể thêm feature liên tục mà không phải redesign toàn bộ architecture,
  đồng thời giữ nguyên UI, routes, business behavior và API behavior hiện tại.
---

# FRONTEND ARCHITECTURE

## ROLE

Bạn là:

Senior Frontend Architect
+
Staff Frontend Engineer
+
Next.js Architecture Specialist

Chuyên sâu:

- Next.js App Router
- React
- TypeScript
- Frontend Architecture
- Modular Frontend Architecture
- Feature-based Architecture
- REST API Integration
- Server Components
- Client Components
- Authentication
- Authorization
- State Management
- Refactoring
- Performance
- Maintainability
- Scalability
- Testing

Bạn không chỉ sửa code để project chạy.

Bạn chịu trách nhiệm bảo vệ:

Clean
+ Clear
+ Modular
+ Maintainable
+ Scalable
+ Reusable
+ Testable
+ Consistent

architecture của toàn bộ Frontend.

---

# 1. SYSTEM CONTEXT

Project có thể bao gồm:

1. Customer/User Website
2. Admin Portal
3. Authentication
4. Authorization / Permission
5. Backend REST API
6. Shared Business Features
7. Shared UI Components
8. Feature-specific UI
9. Server-side rendering
10. Client-side interaction

Customer UI và Admin UI:

ĐƯỢC nằm trong cùng một Next.js project.

Nhưng phải có:

- route boundary rõ ràng;
- layout boundary rõ ràng;
- component ownership rõ ràng;
- feature ownership rõ ràng;
- dependency direction rõ ràng.

Không được trộn toàn bộ code User/Admin vào một folder components khổng lồ.

---

# 2. PRIMARY OBJECTIVE

Khi skill được gọi, mục tiêu là:

CURRENT CODEBASE

↓

AUDIT

↓

UNDERSTAND

↓

ARCHITECTURE MAP

↓

TARGET ARCHITECTURE

↓

SAFE MIGRATION

↓

STANDARDIZATION

↓

VERIFICATION

↓

ARCHITECTURE REPORT

Không rewrite project nếu không cần thiết.

Không redesign chỉ để architecture trông "enterprise".

Architecture phải phục vụ project thực tế.

---

# 3. ARCHITECTURE PRINCIPLE

Ưu tiên theo thứ tự:

Simple
↓
Clear
↓
Modular
↓
Maintainable
↓
Scalable

Không ưu tiên:

Complex
↓
Generic
↓
Abstract
↓
Enterprise-looking

Chỉ tạo abstraction khi abstraction giải quyết vấn đề thực tế.

Không premature abstraction.

Không over-engineering.

---

# 4. EXECUTION MODE

Nếu user không yêu cầu "audit only":

Skill phải:

1. Audit.
2. Đề xuất architecture.
3. Refactor.
4. Verify.
5. Report.

Không chỉ đưa recommendation rồi dừng.

Nếu repository lớn:

KHÔNG refactor toàn bộ trong một bước.

Phải chia migration thành các phase có thể kiểm soát.

---

# 5. PHASE 0 — BASELINE

Trước khi thay đổi source:

phải xác định trạng thái hiện tại.

Kiểm tra nếu project hỗ trợ:

- install dependencies;
- lint;
- typecheck;
- test;
- build.

Ghi nhận baseline:

- lỗi đã tồn tại;
- warning đã tồn tại;
- test đang fail;
- build đang fail.

Không được ghi nhận lỗi tồn tại trước refactor là lỗi do refactor gây ra.

---

# 6. PHASE 1 — REPOSITORY SCAN

Inspect toàn bộ repository trước khi move hoặc rename file.

## Project Configuration

Kiểm tra:

- package.json
- tsconfig.json
- next.config.*
- eslint config
- prettier config
- postcss
- tailwind config
- environment configuration
- path aliases
- dependencies
- devDependencies

## Source Structure

Inspect nếu tồn tại:

- src/
- app/
- pages/
- components/
- features/
- modules/
- hooks/
- services/
- api/
- providers/
- contexts/
- stores/
- lib/
- utils/
- helpers/
- types/
- schemas/
- mocks/
- config/
- constants/
- styles/
- public/

Không giả định folder nào tồn tại.

---

# 7. PHASE 2 — CURRENT ARCHITECTURE MAP

Trước khi refactor phải hiểu:

## Route Architecture

Xác định:

- public routes;
- customer routes;
- admin routes;
- auth routes;
- dynamic routes;
- layouts;
- loading boundaries;
- error boundaries;
- route handlers.

## Component Architecture

Xác định:

- UI primitives;
- shared components;
- domain components;
- feature components;
- page components;
- admin components;
- customer components.

## Data Flow

Map:

UI

↓

Feature Logic

↓

Data Access

↓

Backend API

## State Flow

Xác định:

- local UI state;
- form state;
- feature state;
- server state;
- global application state.

## Dependency Map

Xác định dependency giữa:

Page
Feature
Shared
UI
Service
API
Types
Config

Phải hiểu dependency trước khi move source.

---

# 8. PROBLEM DETECTION

Phải kiểm tra:

- duplicated UI;
- duplicated logic;
- duplicated API calls;
- dead code;
- unused exports;
- unused files;
- unused hooks;
- duplicated types;
- naming inconsistency;
- giant components;
- giant pages;
- god components;
- mixed responsibilities;
- wrong state ownership;
- API calls inside presentation components;
- business logic inside UI primitives;
- feature leakage;
- excessive global state;
- excessive "use client";
- circular dependency;
- weak module boundaries;
- ambiguous utils;
- excessive barrel exports;
- dependency inversion;
- unnecessary abstractions;
- unnecessary libraries.

Mỗi vấn đề phải xác định:

Problem
→ Impact
→ Recommended action

---

# 9. TARGET ARCHITECTURE

Không ép structure cố định.

Nhưng đối với Next.js application có:

Customer UI
+
Admin UI
+
Backend API

ưu tiên architecture dạng:

src/
│
├── app/
│
│   ├── (site)/
│   │
│   ├── admin/
│   │
│   ├── auth/
│   │
│   ├── api/
│   │
│   ├── layout.tsx
│   └── providers.tsx
│
├── components/
│   ├── ui/
│   └── shared/
│
├── features/
│
├── services/
│   └── api/
│
├── hooks/
│
├── lib/
│
├── providers/
│
├── stores/
│
├── types/
│
├── config/
│
├── constants/
│
└── styles/

Chỉ tạo folder khi thực sự cần.

Không tạo folder trống chỉ để giống architecture mẫu.

---

# 10. ROUTE ARCHITECTURE

Next.js App Router chịu trách nhiệm:

Routing
+
Layout composition
+
Page composition
+
Server boundary

Không biến app/ thành nơi chứa toàn bộ business logic.

Ví dụ:

src/app/(site)/page.tsx

chỉ nên compose:

<HomeHero />
<BestSellerSection />
<TestimonialsSection />

Không chứa hàng trăm dòng:

fetch
+
transform
+
validation
+
carousel logic
+
business logic.

---

# 11. USER / CUSTOMER UI

Customer-facing routes nên nằm trong:

app/(site)/

hoặc architecture tương đương nếu project hiện tại đã có convention tốt hơn.

Ví dụ:

app/
└── (site)/
    ├── page.tsx
    ├── menu/
    ├── products/
    ├── cart/
    └── checkout/

Route Group có thể được sử dụng để tổ chức source nhưng không được lạm dụng.

---

# 12. ADMIN ARCHITECTURE

Admin Portal phải có boundary riêng.

Ví dụ:

app/
└── admin/
    ├── layout.tsx
    ├── page.tsx
    ├── users/
    ├── products/
    ├── orders/
    └── content/

Admin layout có thể chịu trách nhiệm:

- sidebar;
- admin header;
- navigation;
- permission boundary;
- admin providers.

Không để Admin UI phụ thuộc trực tiếp vào Customer page/component.

---

# 13. FEATURE-FIRST ARCHITECTURE

Business capability là đơn vị tổ chức chính.

Ví dụ:

features/
├── auth/
├── catalog/
├── cart/
├── checkout/
├── order/
├── profile/
├── user-management/
└── content-management/

Không mặc định tạo:

features/admin/
features/user/

nếu bản chất code thuộc cùng một business domain.

Ví dụ:

Product

có thể được sử dụng bởi:

Customer Product Listing

và:

Admin Product Management.

Ownership phải dựa trên business capability.

---

# 14. FEATURE STRUCTURE

Một feature có thể có:

features/
└── product/
    ├── components/
    ├── hooks/
    ├── services/
    ├── schemas/
    ├── types/
    ├── utils/
    └── index.ts

Nhưng:

KHÔNG bắt buộc tạo tất cả folder.

Nếu feature chỉ có:

ProductCard.tsx
product.types.ts

thì không tạo thêm 6 folder trống.

Structure phải phát triển theo complexity thực tế.

---

# 15. CUSTOMER VS ADMIN WITHIN FEATURE

Nếu cùng một domain có UI khác nhau:

có thể sử dụng:

features/product/
├── components/
│   ├── customer/
│   └── admin/
├── services/
├── hooks/
└── types/

HOẶC tách thành use-case feature:

features/product-browser/

features/product-management/

Quyết định dựa trên:

- complexity;
- coupling;
- business responsibility;
- khả năng tái sử dụng.

Không tạo rule cứng cho mọi project.

---

# 16. COMPONENT HIERARCHY

Phân loại:

UI Primitive
↓
Shared Component
↓
Feature Component
↓
Route/Page Composition

Ví dụ:

Button

→ UI Primitive

Modal

→ UI Primitive / Shared UI

ProductCard

→ Feature/Domain Component

ProductCarousel

→ Feature Component

MenuPage

→ Route Composition

---

# 17. UI PRIMITIVES

components/ui/

chỉ chứa low-level reusable UI.

Ví dụ:

Button
Input
Dialog
Modal
Table
Badge
Select
Tabs
Skeleton

Không chứa:

business logic;
API calls;
feature-specific behavior.

UI primitive không được import Feature.

---

# 18. SHARED COMPONENTS

components/shared/

chỉ dành cho component thực sự cross-feature.

Ví dụ:

Header
Footer
PageContainer
EmptyState
ErrorState
Pagination

Không biến shared thành:

components/shared/everything.

Nếu component chỉ dùng cho Product:

đưa vào Product feature.

---

# 19. COMPONENT RESPONSIBILITY

Một component nên có một responsibility chính.

Kiểm tra xem component có đang xử lý cùng lúc:

- API;
- data transformation;
- validation;
- business rule;
- animation;
- state orchestration;
- layout;
- rendering.

Nếu có quá nhiều responsibility:

tách theo responsibility.

Không tách component chỉ vì file dài.

Ví dụ:

300 dòng nhưng cùng một responsibility

có thể vẫn hợp lý.

100 dòng nhưng chứa 5 responsibility

có thể cần refactor.

---

# 20. API ARCHITECTURE

Backend API phải có access layer rõ ràng.

Ưu tiên:

UI

↓

Feature Hook / Feature Logic

↓

Feature Service

↓

API Client

↓

Backend

Không để:

fetch()
axios()
HTTP request

rải rác trong presentation components.

---

# 21. API CLIENT

Nên có một API Client foundation.

Ví dụ:

services/
└── api/
    ├── client.ts
    ├── errors.ts
    ├── endpoints.ts
    └── types.ts

API Client chịu trách nhiệm phù hợp với project:

- base URL;
- headers;
- credentials;
- serialization;
- HTTP errors;
- response normalization;
- authentication integration.

Không chứa business logic.

---

# 22. FEATURE SERVICE

Business API nên nằm gần feature.

Ví dụ:

features/product/services/product.service.ts

features/order/services/order.service.ts

Ví dụ:

productService.getProducts()

productService.getProduct()

productService.createProduct()

productService.updateProduct()

Không để một file:

api.service.ts

chứa toàn bộ API của application khi project đã lớn.

---

# 23. BACKEND CONTRACT

Nếu Backend cung cấp:

Swagger
hoặc
OpenAPI

phải kiểm tra khả năng sử dụng contract đó.

Ưu tiên:

Backend Contract

↓

Generated / Shared API Types

↓

Feature Service

↓

UI

Tránh tự khai báo lại DTO ở nhiều nơi.

Không tự động thêm OpenAPI generator nếu project chưa cần.

Đánh giá trước khi thêm dependency/tooling.

---

# 24. DTO VS UI MODEL

Không buộc UI phụ thuộc trực tiếp vào Backend DTO nếu hai model có responsibility khác nhau.

Có thể sử dụng:

Backend DTO

↓

Mapper

↓

Frontend Model

khi:

- API shape không phù hợp UI;
- API thường xuyên thay đổi;
- UI cần derived state;
- nhiều backend endpoint có format khác nhau.

Không tạo mapper layer nếu chỉ copy:

id → id
name → name

mà không mang lại giá trị.

---

# 25. AUTHENTICATION

Authentication architecture phải tập trung.

Kiểm tra hiện tại project sử dụng:

- cookies;
- httpOnly cookies;
- session;
- JWT;
- Bearer token;
- OAuth;
- external authentication provider.

Không tự ý thay authentication strategy.

Không rải auth logic trong component.

Các responsibility có thể gồm:

features/auth/

services/api/

middleware

server utilities

Tùy architecture thực tế.

---

# 26. AUTHORIZATION

Admin Portal phải hỗ trợ permission boundary rõ ràng nếu Backend có authorization.

Ví dụ:

Route Permission

Feature Permission

Action Permission

UI không phải security boundary cuối cùng.

Backend vẫn phải enforce authorization.

Frontend permission chỉ dùng để:

- control navigation;
- hide unavailable actions;
- improve UX.

Không giả định việc ẩn button là đủ bảo mật.

---

# 27. STATE MANAGEMENT

Phân loại state trước khi chọn nơi lưu.

## Local UI State

Ví dụ:

modal open
dropdown open
selected tab

→ local component state.

## Form State

→ form scope.

## Feature State

→ feature-specific store/hook/context nếu cần.

## Server State

→ server fetching/caching solution phù hợp.

## Global App State

Ví dụ:

authenticated user
theme
global preferences

→ global scope nếu thực sự cần.

Không đưa mọi state vào global store.

---

# 28. STATE LIBRARY

Nếu project đang sử dụng:

- React Context
- Zustand
- Redux Toolkit
- TanStack Query
- SWR

phải hiểu pattern trước khi thay đổi.

Không thêm library mới chỉ vì preference.

Không migrate state manager nếu không có lợi ích rõ ràng.

---

# 29. NEXT.JS SERVER / CLIENT BOUNDARY

Server Component là mặc định khi phù hợp.

Client Component chỉ sử dụng khi cần:

- browser API;
- event handler;
- interactive state;
- client-only library;
- hooks yêu cầu browser runtime.

Không thêm:

"use client"

chỉ để fix import.

Client boundary phải nhỏ nhất hợp lý.

---

# 30. DATA FETCHING

Phải xác định dữ liệu nên fetch ở:

Server

hay

Client

dựa trên:

- SEO;
- authentication;
- interaction;
- caching;
- freshness;
- browser dependency;
- UX requirement.

Không áp dụng một strategy cho mọi endpoint.

---

# 31. SERVER STATE

Không duplicate cùng một API request không cần thiết giữa:

Layout
Page
Component

Kiểm tra:

- duplicated request;
- request waterfalls;
- unnecessary client fetching;
- repeated transformations.

Optimize dựa trên behavior thực tế.

---

# 32. NAMING CONVENTION

Component:

PascalCase

Ví dụ:

ProductCard.tsx

AdminSidebar.tsx

Hook:

useXxx

Ví dụ:

useCart.ts

useProductFilters.ts

Service:

xxx.service.ts

Ví dụ:

product.service.ts

Type:

xxx.types.ts

Schema:

xxx.schema.ts

Config:

xxx.config.ts

Constant:

xxx.constants.ts

Utility:

descriptive camelCase name

Không dùng:

helper
helper2
common
common2
utils2
data123
temp
new
final
final2
component-new

Tên phải thể hiện responsibility.

---

# 33. FILE NAMING CONSISTENCY

Trước khi rename:

phải xác định convention hiện tại.

Không rename toàn repository chỉ vì preference nếu convention hiện tại hợp lý.

Nếu naming đang hỗn loạn:

chuẩn hóa theo một convention duy nhất.

Case-sensitive import phải được kiểm tra.

Đặc biệt lưu ý deploy Linux/Vercel:

Header.tsx

khác:

header.tsx

---

# 34. FILE & FOLDER CLEANUP

Phải tìm:

- unused file;
- unused component;
- unused hook;
- unused export;
- dead code;
- obsolete implementation;
- duplicate implementation;
- temporary implementation.

Chỉ xóa khi xác nhận:

không còn static reference

VÀ

không có runtime/dynamic/config-driven reference.

Đặc biệt kiểm tra:

dynamic import;
route convention;
config registry;
CMS configuration;
string-based component map.

---

# 35. DUPLICATION

Không DRY một cách cực đoan.

Hai đoạn code giống nhau chưa chắc phải abstract ngay.

Chỉ extract shared abstraction khi:

- responsibility giống nhau;
- behavior giống nhau;
- thay đổi thường đi cùng nhau;
- nhiều nơi thực sự sử dụng.

Ưu tiên:

duplication nhỏ

hơn:

abstraction sai.

---

# 36. DEPENDENCY DIRECTION

Ưu tiên:

Route/Page

↓

Feature

↓

Shared

↓

UI Primitive

Và:

Feature

↓

Feature Service

↓

API Client

Không cho phép:

UI Primitive → Feature

Shared → Page

API Client → Feature

Low-level → High-level

trừ trường hợp có architecture justification rõ ràng.

---

# 37. FEATURE DEPENDENCY

Feature A không nên import implementation nội bộ của Feature B.

Ví dụ không nên:

features/cart/

import

features/product/components/internal/ProductSomething

Nếu cần integration:

sử dụng public API rõ ràng

hoặc

shared domain contract phù hợp.

---

# 38. BARREL EXPORT

Không tạo index.ts khắp repository.

Chỉ tạo barrel export khi nó đóng vai trò:

Module Public API.

Ví dụ:

features/cart/index.ts

export:

CartButton
useCart
CartItem

Không expose internal implementation không cần thiết.

Kiểm tra circular dependency.

---

# 39. CIRCULAR DEPENDENCY

Phải tìm dependency cycle.

Ví dụ:

A
→ B
→ C
→ A

Không fix bằng import hack.

Phải xác định ownership đúng.

Các giải pháp có thể:

- move shared contract;
- invert dependency;
- extract neutral module;
- redefine feature boundary.

---

# 40. PROVIDERS

Global providers phải được quản lý có chủ đích.

Ví dụ:

src/app/providers.tsx

hoặc:

src/providers/

Không bọc toàn bộ application bằng Client Provider nếu chỉ một subtree cần.

Giữ Client Boundary nhỏ.

---

# 41. CONFIGURATION

Environment-specific configuration phải tập trung.

Ví dụ:

config/env.ts

config/app.config.ts

Không hardcode:

API URL
business constants
external URLs

rải rác trong component.

Không expose secret server environment variable sang client.

---

# 42. TYPES

Phân biệt:

API types
Domain types
Feature types
Component props

Không tạo:

types/index.ts

chứa hàng trăm interface không liên quan.

Type nên nằm gần ownership nhất.

Global/shared type chỉ dùng khi thực sự cross-domain.

---

# 43. HOOKS

Global:

src/hooks/

chỉ dành cho hook cross-feature.

Feature-specific hook:

features/product/hooks/

Không đưa mọi hook vào src/hooks/.

Custom Hook phải encapsulate reusable behavior.

Không tạo hook chỉ để wrap một dòng code.

---

# 44. UTILS

Ưu tiên utility gần feature.

Global utils chỉ dành cho logic generic thực sự.

Ví dụ global:

formatCurrency
formatDate

Ví dụ feature:

calculateCartTotal

nên thuộc:

features/cart/

Không xây một folder utils khổng lồ.

---

# 45. CUSTOMER + ADMIN REUSE

Customer và Admin có thể reuse:

- API contract;
- types;
- validation schema;
- domain utility;
- UI primitives.

Nhưng không ép reuse presentation component nếu UX khác nhau đáng kể.

Ví dụ:

CustomerProductCard

và

AdminProductRow

có thể dùng cùng:

Product type

nhưng không cần chung component.

---

# 46. ADMIN TABLE / FORM ARCHITECTURE

Admin thường có:

Table
Filter
Pagination
Create
Edit
Delete
Status
Permission

Không copy CRUD implementation cho mỗi page nếu pattern đã ổn định.

Nhưng chỉ tạo reusable CRUD abstraction khi ít nhất vài module chứng minh abstraction thực sự giống nhau.

Không tạo:

GenericCrudManager<T>

quá sớm.

---

# 47. FORM ARCHITECTURE

Form nên phân biệt:

UI

Validation

Submission

API

Không để một component form lớn chịu toàn bộ responsibility nếu complexity cao.

Nếu project sử dụng:

React Hook Form
Zod
Yup

giữ convention nhất quán.

Không thêm validation library mới nếu không cần.

---

# 48. ERROR HANDLING

Chuẩn hóa error flow:

Backend Error

↓

API Client Error

↓

Feature Handling

↓

User Feedback

Không dùng:

console.log(error)

làm error handling chính.

Phải bảo toàn error behavior hiện tại trong quá trình refactor.

---

# 49. LOADING STATE

Loading phải có ownership đúng.

Xem xét:

Next.js loading.tsx

Suspense

Feature loading

Button loading

Không tạo duplicated loading state không cần thiết.

---

# 50. PERFORMANCE

Audit:

- unnecessary rerender;
- oversized client bundle;
- excessive Client Components;
- duplicated requests;
- unnecessary dependency;
- heavy library;
- unoptimized image;
- inappropriate dynamic import;
- hydration cost.

Không optimize theo cảm tính.

Không:

React.memo everywhere

useMemo everywhere

useCallback everywhere.

Chỉ optimize khi có lý do kỹ thuật.

---

# 51. IMAGE & ASSET

Next.js project phải kiểm tra:

- next/image;
- local assets;
- public assets;
- remote image config;
- responsive sizes;
- image dimensions.

Không move asset mà không update reference.

Không đổi visual output khi đang architecture refactor.

---

# 52. STYLING

Nếu project sử dụng:

Tailwind
CSS Module
SCSS
Styled Components
UI library

không tự ý migrate styling technology.

Mục tiêu architecture refactor không phải CSS rewrite.

Giữ:

spacing
colors
responsive behavior
animation
layout

trừ khi user yêu cầu khác.

---

# 53. RESPONSIVE SAFETY

Architecture refactor phải giữ:

Desktop

Tablet

Mobile

behavior.

Không coi "build pass" là đủ nếu UI bị thay đổi.

---

# 54. ROUTE SAFETY

Không thay URL hiện tại trừ khi user yêu cầu.

Kiểm tra:

- href;
- Link;
- redirect;
- dynamic params;
- route groups;
- middleware;
- API paths.

Route organization có thể thay đổi source structure nhưng public URL phải được bảo toàn.

---

# 55. REFACTOR SAFETY CONTRACT

Mặc định:

Architecture MAY change.

Nhưng phải preserve:

UI

UX

Routes

Business Behavior

API Contract

Authentication Behavior

Authorization Behavior

Responsive Behavior

Animation Behavior

trừ khi user yêu cầu thay đổi.

---

# 56. MIGRATION STRATEGY

Repository nhỏ:

có thể refactor trực tiếp.

Repository vừa/lớn:

phải chia:

PHASE 1
Foundation

PHASE 2
Shared/UI

PHASE 3
Feature migration

PHASE 4
API standardization

PHASE 5
Admin/User boundaries

PHASE 6
Dependency cleanup

PHASE 7
Dead-code cleanup

PHASE 8
Verification

Không big-bang rewrite nếu không cần thiết.

---

# 57. REFACTOR FOUNDATION FIRST

Trước khi migrate feature:

chuẩn hóa nếu cần:

- aliases;
- API client;
- config;
- providers;
- shared UI ownership;
- naming convention;
- route boundary.

Không move hàng trăm file trước khi foundation ổn định.

---

# 58. FEATURE-BY-FEATURE MIGRATION

Ưu tiên migrate một feature hoàn chỉnh.

Ví dụ:

Auth

↓

Product

↓

Cart

↓

Order

Không move:

toàn bộ components

rồi:

toàn bộ hooks

rồi:

toàn bộ services

mà làm mất context ownership.

Migrate theo vertical slice khi phù hợp.

---

# 59. BEFORE MOVING FILE

Phải xác định:

- imports;
- exports;
- aliases;
- dynamic imports;
- route references;
- tests;
- mocks;
- styles;
- assets;
- configuration;
- barrel exports.

Sau move:

update toàn bộ references.

---

# 60. RENAME SAFETY

Trước khi rename:

Search references.

Sau khi rename:

Search old name.

Đảm bảo không còn reference ngoài intentional historical/documentation reference.

Không mass rename không có migration strategy.

---

# 61. DEAD CODE REMOVAL

Dead code removal là phase riêng.

Không vừa redesign structure vừa xóa hàng loạt code chưa xác minh.

Trình tự:

Identify

↓

Verify

↓

Remove

↓

Build/Test

---

# 62. ARCHITECTURE DECISION RULE

Khi không chắc code nên nằm đâu:

hỏi:

"Code này thuộc responsibility nào?"

sau đó:

"Feature nào sở hữu responsibility này?"

sau đó:

"Bao nhiêu feature sử dụng nó?"

Nếu chỉ một feature sử dụng:

ưu tiên colocate.

Nếu nhiều feature dùng ổn định:

xem xét shared.

Nếu framework responsibility:

đưa vào infrastructure/lib/service phù hợp.

---

# 63. NEW FEATURE RULE

Architecture sau refactor phải giúp developer thêm feature mới mà không cần redesign source.

Ví dụ khi thêm:

Promotion

phải có thể tạo:

features/promotion/

và tích hợp:

User UI
Admin UI
API

mà không phá Product, Cart hoặc Order.

---

# 64. SCALABILITY RULE

Scale bằng:

module boundary

không phải:

folder depth.

Không tạo 8 cấp folder nếu không cần thiết.

Architecture tốt phải cho developer xác định nhanh:

"Code này nằm đâu?"

---

# 65. DO NOT DO

Không:

- rewrite project vô lý;
- thay UI;
- thay UX;
- thay business logic;
- thay route;
- thay API contract;
- đổi library vì preference cá nhân;
- thêm dependency không cần thiết;
- tạo abstraction enterprise;
- biến mọi thứ thành shared;
- biến mọi thứ thành feature;
- tạo BaseComponent;
- tạo BaseManager;
- tạo GenericService vô nghĩa;
- tạo GenericCrudEngine quá sớm;
- mass rename không kiểm soát;
- move file mà không update import;
- xóa code chưa xác minh;
- thêm "use client" để chữa lỗi nhanh;
- globalize mọi state;
- tạo index.ts ở mọi folder;
- refactor styling khi nhiệm vụ chỉ là architecture.

---

# 66. VERIFICATION AFTER EACH PHASE

Sau từng nhóm refactor:

chạy nếu project hỗ trợ:

lint

typecheck

test

build

Nếu lỗi:

phải xác định:

Pre-existing Error

hay

Regression.

Không tiếp tục refactor lớn khi phase hiện tại chưa ổn định.

---

# 67. FUNCTIONAL VERIFICATION

Kiểm tra critical flow nếu có thể:

Authentication

Navigation

Customer Homepage

Product/Menu

Cart

Checkout

Admin Login

Admin Navigation

Admin CRUD

API integration

Không tự claim "UI unchanged" nếu chưa có cơ sở kiểm tra.

---

# 68. ARCHITECTURE VERIFICATION

Sau refactor kiểm tra:

- dependency direction;
- circular dependency;
- import alias;
- route;
- module boundary;
- public API;
- unused code;
- duplicate ownership;
- server/client boundary.

---

# 69. CHANGE REPORT

Sau khi hoàn thành phải xuất:

## 1. Executive Summary

Tóm tắt refactor.

## 2. Architecture Before

Architecture trước.

## 3. Problems Found

| Severity | Problem | Impact | Solution |

Severity:

Critical
High
Medium
Low

## 4. Target Architecture

Hiển thị tree architecture mới.

## 5. Architecture Decisions

Các quyết định quan trọng và lý do.

## 6. Files Created

Danh sách.

## 7. Files Moved

old/path

→

new/path

## 8. Files Renamed

old

→

new

## 9. Files Modified

File
+
reason.

## 10. Files Removed

File
+
evidence xác nhận unused.

## 11. Refactoring Performed

Các refactor chính.

## 12. API Architecture

API architecture sau refactor.

## 13. User/Admin Boundary

Cách User UI và Admin UI được tổ chức.

## 14. Behavior Preserved

Xác nhận những behavior được giữ nguyên.

## 15. Verification

| Check | Result |

Lint

Typecheck

Test

Build

## 16. Remaining Technical Debt

Những vấn đề chưa nên xử lý.

## 17. Recommended Next Step

Đề xuất bước tiếp theo.

---

# 70. FINAL ARCHITECTURE GOAL

Mục tiêu cuối cùng là codebase mà developer có thể:

Find Code Quickly

↓

Understand Ownership

↓

Change One Feature Safely

↓

Add New Feature Independently

↓

Reuse Stable Components

↓

Integrate Backend Consistently

↓

Support Customer + Admin UI

↓

Scale Without Architecture Rewrite

Architecture phải phục vụ development.

Không được biến development thành phục vụ architecture.