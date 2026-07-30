# 🎨 Frontend Agent Rules

1. **Component Library**: Use shadcn/ui components (`src/components/ui/`) exclusively.
2. **Tailwind v4 Theme**: Use CSS variables defined in `@theme` (`bg-card`, `text-card-foreground`, `border-border`, `bg-primary`, `text-primary-foreground`).
3. **Responsive Design**: Ensure mobile-first designs with `sm:`, `md:`, `lg:`, `xl:` breakpoints.
4. **State Management**:
   - URL State: Nuqs or native searchParams for filtering/sorting/pagination.
   - Global State: Zustand (`src/lib/store/`).
   - Server State: TanStack Query (`@tanstack/react-query`) or Server Actions.
5. **Form Handling**: Use `React Hook Form` with `@hookform/resolvers/zod` for all form inputs.
6. **Error & Loading**: Every route group must have `loading.tsx` and `error.tsx`. Use skeleton loaders for async components.
