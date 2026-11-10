<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- App code is plain JavaScript (.js/.jsx) per client spec; no TypeScript in new files.
- Shop data (cart, accounts, orders) lives in src/lib/shop.jsx using browser storage as a stand-in until a real backend replaces those functions.
- The frontend admin page uses the shared ShopProvider for product overrides and order updates so the storefront and management views stay in sync; it is explicitly a demo, not an authorization boundary.
- Order status constants and admin validation live in browser-safe library modules so management behavior can be tested without rendering pages.
- Admin edit and order dialogs use Radix Dialog primitives to keep keyboard focus inside the dialog and support Escape dismissal.
- Product overrides include added records with UUID-based IDs and deletion tombstones; resolveProducts supplies the live catalog to keep storefront and cart behavior consistent without changing historical orders.
- NRP is normalized to the existing price field at the shop data boundary so cart, sorting, and checkout use the same admin-configured selling price.
- Product detail rendering resolves IDs through the hydrated shop catalog rather than falling back to static loader data, allowing added products and respecting deletions.
