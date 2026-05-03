# Sora Advisory — Design Language Guide

> **Scope:** All UI work in this repo must follow this guide. New features, pages, and components ship only after passing a self-check against these rules. When in doubt, look at an existing page and match it.

---

## 1. Philosophy

The visual language is Apple Human Interface Guidelines (HIG) adapted for a web SPA. It prioritises clarity, data density, and trust — qualities that matter when an advisor is sitting across from a client.

Three principles drive every decision:

1. **Calm authority.** No loud gradients, no decorative colour for its own sake. Colour signals meaning.
2. **Tactile feedback.** Every interactive element has a visible state change (hover, active, disabled). Nothing should feel dead.
3. **Consistent rhythm.** Spacing, radius, and type sizes come from the token set below. Arbitrary values are a last resort.

---

## 2. Colour

All colour tokens are defined in `tailwind.config.js`. Reference them by token name — never hardcode a hex in JSX unless the value is truly dynamic (e.g. stage colours driven by data).

### Brand & Semantic

| Token | Hex | Usage |
|---|---|---|
| `hig-blue` | `#2E96FF` | Primary actions, links, focus rings, interactive highlights |
| `hig-navy` | `#040E1C` | Login panel background, dark surfaces only |
| `hig-green` | `#34C759` | Success, active status, positive delta |
| `hig-orange` | `#FF9500` | Warnings, in-progress, pending states |
| `hig-red` | `#FF3B30` | Errors, destructive actions, overdue |
| `hig-teal` | `#5AC8FA` | Supplementary data (charts, tags) |
| `hig-purple` | `#AF52DE` | Supplementary data (charts, tags) |
| `hig-pink` | `#FF2D55` | Supplementary data (charts, tags) |

### Surface & Text

| Token | Hex | Usage |
|---|---|---|
| `hig-bg` | `#F2F2F7` | Page/app background |
| `hig-card` | `#FFFFFF` | Card and panel backgrounds |
| `hig-text` | `#1C1C1E` | Primary body text, headings |
| `hig-text-secondary` | `#8E8E93` | Secondary/supporting text, labels |
| `hig-separator` | `#C6C6C8` | Dividers between sections |

### Grey Scale

| Token | Hex | Usage |
|---|---|---|
| `hig-gray-1` | `#8E8E93` | Secondary text (same as `hig-text-secondary`) |
| `hig-gray-2` | `#AEAEB2` | Placeholder icons, muted controls |
| `hig-gray-3` | `#C7C7CC` | Placeholder text, very muted labels |
| `hig-gray-4` | `#D1D1D6` | Default input borders |
| `hig-gray-5` | `#E5E5EA` | Subtle borders, dividers, card outlines |
| `hig-gray-6` | `#F2F2F7` | Background tints, disabled fills, even rows |

### Opacity Variants

Tailwind's `/` opacity syntax is preferred over raw `rgba()` for tokenised colours:

```jsx
// Good
className="bg-hig-blue/10 text-white/[0.36] border-hig-red/[0.22]"

// Avoid (unless the value is data-driven)
style={{ background: 'rgba(46,150,255,0.1)' }}
```

### Icon Accent Backgrounds

Section card icon containers follow a consistent pattern: `10%` opacity fill of the icon's colour.

```jsx
// Blue icon
iconColor="#2E96FF"  iconBg="rgba(46,150,255,0.1)"

// Green icon
iconColor="#34C759"  iconBg="rgba(52,199,89,0.1)"

// Orange icon
iconColor="#FF9500"  iconBg="rgba(255,149,0,0.1)"

// Red icon
iconColor="#FF3B30"  iconBg="rgba(255,59,48,0.1)"
```

These are `style={}` props on the icon container because they're passed as dynamic props — not hardcoded literals in JSX.

---

## 3. Typography

Font stack (applies to `body` via globals.css):

```
-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text",
"Helvetica Neue", Helvetica, Arial, sans-serif
```

Always use `font-sans` on root elements; never override the family inline.

### Type Scale

| Token | Size | Line-height | Weight | Usage |
|---|---|---|---|---|
| `text-hig-title1` | 28px | 34px | 700 | Page headings |
| `text-hig-title2` | 22px | 28px | 700 | Section headings |
| `text-hig-title3` | 20px | 25px | 600 | Sub-section titles |
| `text-hig-headline` | 17px | 22px | 600 | Card titles, panel headers |
| `text-hig-body` | 17px | 22px | 400 | Main body copy, input text |
| `text-hig-callout` | 16px | 21px | 400 | Secondary body, descriptions |
| `text-hig-subhead` | 15px | 20px | 400 | Labels, form help text |
| `text-hig-footnote` | 13px | 18px | 400 | Supporting detail, timestamps |
| `text-hig-caption1` | 12px | 16px | 400 | Captions, badges, tags |
| `text-hig-caption2` | 11px | 13px | 400 | Micro-labels, version stamps |

### Custom Sizes

Use arbitrary values only for one-off display headlines that fall outside the scale:

```jsx
className="text-[26px] font-bold"   // Settings page header
className="text-[42px] font-bold"   // Login page hero
```

### Label Conventions

- **Form labels** → `hig-label` class (`text-hig-subhead font-medium text-hig-text mb-1.5`)
- **Section sub-labels / eyebrow text** → `text-hig-caption1 font-bold uppercase tracking-wider text-hig-text-secondary`
- **Read-only field values** → `text-hig-text-secondary cursor-default`

---

## 4. Spacing

No arbitrary spacings without reason. Prefer the Tailwind 4-point scale. Common values in use:

| Scale | px | Usage |
|---|---|---|
| `gap-1` | 4px | Tight icon-label pairs |
| `gap-2` | 8px | Compact rows, pill items |
| `gap-3` / `gap-3.5` | 12/14px | Form field gaps, list items |
| `gap-4` | 16px | Standard form/content gaps |
| `gap-5` | 20px | Between cards or major groups |
| `gap-7` | 28px | Page-level column gaps |
| `p-4` / `p-5` | 16/20px | Card inner padding (compact) |
| `p-6` | 24px | Card inner padding (comfortable) |
| `mb-4` | 16px | Between stacked cards |
| `mb-7` | 28px | Page header bottom margin |

---

## 5. Border Radius

| Token | Value | Usage |
|---|---|---|
| `rounded-hig-sm` | 8px | Inputs, badges, small buttons, error banners |
| `rounded-hig` | 12px | Dropdowns, tooltips, inline panels |
| `rounded-hig-lg` | 16px | Cards (`hig-card`), modals, section containers |

For elements outside these tokens, use Tailwind's named scale (`rounded-full`, `rounded-md`) or an arbitrary value only when the design clearly requires it (e.g. `rounded-[11px]` for login pills, `rounded-[13px]` for login field wrappers).

---

## 6. Shadow

| Token | Value | Usage |
|---|---|---|
| `shadow-hig` | `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)` | Cards (default) |
| `shadow-hig-md` | `0 4px 12px rgba(0,0,0,0.08)` | Elevated panels, active dropdowns |
| `shadow-hig-lg` | `0 8px 24px rgba(0,0,0,0.12)` | Modals, dialogs, floating sheets |

Focus rings do not use the shadow token — they use `focus:ring-2 focus:ring-hig-blue/20` (built into `hig-input`).

---

## 7. Component Classes

Defined in `globals.css @layer components`. Never re-implement these inline.

### `hig-card`
White card with `rounded-hig-lg`, `shadow-hig`, and a `border border-black/[0.04]` outline.

```jsx
<div className="hig-card p-6">…</div>
<div className="hig-card p-5 mb-4">…</div>
```

### `hig-input`
Full-width text input. 44px min-height, `rounded-hig-sm`, gray border, blue focus ring.

```jsx
<input className="hig-input" />
<input className="hig-input pl-9" />            {/* icon-padded left */}
<input className="hig-input pr-10" />           {/* icon-padded right */}
<input className="hig-input border-hig-red focus:border-hig-red focus:ring-hig-red/20" />  {/* error state */}
<input className="hig-input bg-hig-gray-5 text-hig-text-secondary cursor-default" readOnly />  {/* read-only */}
```

### `hig-label`
Standard form label.

```jsx
<label className="hig-label">Full Name</label>
```

### Buttons

```jsx
<button className="hig-btn-primary">Save</button>
<button className="hig-btn-secondary">Cancel</button>
<button className="hig-btn-ghost">Back</button>

{/* Destructive variant — override bg on hig-btn-primary */}
<button className="hig-btn-primary bg-hig-red hover:bg-red-600">Delete</button>
```

### Badges

```jsx
<span className="hig-badge-green">Active</span>
<span className="hig-badge-red">Lapsed</span>
<span className="hig-badge-orange">Pending</span>
<span className="hig-badge-blue">New</span>
```

### Utilities

```jsx
className="uw-no-scrollbar"   // hide scrollbar (horizontal scroll panels)
className="uw-press"          // scale(0.95) press feedback on non-button elements
```

---

## 8. Patterns

### Section Card with Icon Header

Used on Settings, forms, and any grouping that needs a labelled container.

```jsx
<div className="hig-card p-6 mb-4">
  <div className="flex items-center gap-3 mb-5">
    <div style={{ width: 32, height: 32, borderRadius: 9,
                  background: iconBg, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={16} style={{ color: iconColor }} />
    </div>
    <h2 className="text-hig-headline font-semibold text-hig-text">{title}</h2>
  </div>
  {children}
</div>
```

The `iconBg` / `iconColor` values are always passed as props — do not hardcode them in the pattern component.

### Form Layout

```jsx
<form className="flex flex-col gap-3.5">
  <div className="grid grid-cols-2 gap-3.5">
    <div>
      <label className="hig-label">…</label>
      <input className="hig-input" />
    </div>
    <div>…</div>
  </div>
  <div className="flex justify-end pt-1">
    <button className="hig-btn-primary" style={{ minWidth: 140 }}>Save</button>
  </div>
</form>
```

### Error Banner (inline form error)

```jsx
<div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-hig-sm px-3.5 py-2.5">
  <AlertCircle size={14} className="text-hig-red shrink-0" />
  <p className="text-hig-footnote text-hig-red">{errorMessage}</p>
</div>
```

### Danger / Destructive Zone

```jsx
<div className="rounded-hig-lg p-5 bg-red-50 border border-red-100">
  <p className="text-hig-subhead font-semibold text-hig-text mb-0.5">Delete Record</p>
  <p className="text-hig-footnote text-hig-text-secondary leading-relaxed">…</p>
  <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-hig-sm border border-hig-red
                     bg-white text-hig-red text-hig-footnote font-medium mt-3.5
                     transition-colors hover:bg-red-50">
    <Trash2 size={13} /> Delete
  </button>
</div>
```

### Confirm / Delete Modal

```jsx
<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
  <div className="bg-white rounded-hig-lg shadow-hig-lg w-full max-w-sm p-6">
    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
      <AlertTriangle size={18} className="text-hig-red" />
    </div>
    {/* title + body */}
    <div className="flex gap-2.5 mt-5">
      <button className="hig-btn-secondary flex-1">Cancel</button>
      <button className="hig-btn-primary flex-1 bg-hig-red hover:bg-red-600">Delete</button>
    </div>
  </div>
</div>
```

### Date Bucket Header (activity/timeline lists)

```jsx
<div className="flex items-center gap-2 mt-2 mb-1">
  <span className="text-hig-caption2 font-bold uppercase tracking-wider text-hig-text-secondary">
    {label}
  </span>
  <div className="flex-1 h-px bg-hig-gray-5" />
  <span className="text-hig-caption2 text-hig-gray-3 font-medium">{count}</span>
</div>
```

### Smart Suggestions / Info Panel Header

```jsx
<div className="bg-hig-card rounded-hig border border-hig-gray-5 shadow-hig mb-4 overflow-hidden">
  <div className="flex items-center gap-1.5 px-3.5 py-2.5 border-b border-hig-gray-5 bg-hig-gray-6">
    <Zap size={12} className="text-hig-orange" />
    <span className="text-hig-caption1 font-bold uppercase tracking-wider text-hig-text-secondary">
      Smart Suggestions
    </span>
  </div>
  {/* content */}
</div>
```

---

## 9. Interactive States

### The Rule: No JavaScript Hover

`onMouseEnter` / `onMouseLeave` for visual-only state changes are **banned**. Use Tailwind's `hover:` prefix.

```jsx
// ✅
className="hover:bg-gray-50 hover:text-hig-blue hover:border-hig-blue transition-colors"

// ❌
onMouseEnter={e => e.target.style.background = '#F9F9F9'}
```

### State Reference

| State | Pattern |
|---|---|
| Default button hover | `hover:bg-blue-600` (primary), `hover:bg-hig-gray-5` (secondary) |
| Ghost / text hover | `hover:bg-hig-blue/5` or `hover:bg-gray-50` |
| Icon button hover | `hover:text-hig-text transition-colors` |
| Row / tile hover | `hover:bg-gray-50 transition-colors` |
| Destructive hover | `hover:bg-red-50` |
| Active press | `active:scale-[0.98]` (buttons), `uw-press` class (non-buttons) |
| Disabled | `disabled:opacity-40 disabled:pointer-events-none` |
| Input focus | Built into `hig-input` — `focus:border-hig-blue focus:ring-2 focus:ring-hig-blue/20` |
| Field group focus | `focus-within:border-hig-blue focus-within:bg-white focus-within:shadow-[0_0_0_3.5px_rgba(46,150,255,0.14)]` |
| Opacity fade (links, images) | `transition-opacity hover:opacity-80` or `hover:opacity-90` |

### Transition Defaults

```jsx
className="transition-colors"          // colour changes
className="transition-all duration-hig" // multi-property (250ms)
className="transition-opacity"          // opacity only
```

---

## 10. Animation

All keyframes live in `tailwind.config.js` (as `keyframes`) or `globals.css @layer utilities`. No `<style>` injection blocks in JSX files — ever.

### Animation Tokens

| Class | Definition | Usage |
|---|---|---|
| `animate-fade-up` | fadeUp 0.4s ease both | Page entry, staggered lists |
| `animate-slide-in-right` | 0.24s cubic-bezier | Panel slide-in from right |
| `animate-slide-in-left` | 0.24s cubic-bezier | Panel slide-in from left |
| `animate-uw-fade` | uwFadeIn 0.2s ease both | Inline element appear |
| `animate-pop-in` | popIn 0.2s spring both | Dropdown / tooltip appear |
| `animate-shimmer` | 1.4s ease infinite | Skeleton loading state |
| `animate-shake` | shake 0.45s ease | Form error shake |
| `animate-spin` | Tailwind built-in | Spinner / loader |
| `animate-uw-progress` | 0.8s cubic-bezier forwards | Progress bar fill |

### Stagger Pattern

When animating a list of items on entry, use `animate-fade-up` with inline `animationDelay` increments of **70ms**:

```jsx
{items.map((item, i) => (
  <div
    key={item.id}
    className="animate-fade-up"
    style={{ animationDelay: `${i * 70}ms` }}
  >
    …
  </div>
))}
```

### Dynamic (State-Toggled) Animations

Apply animated classes conditionally via a ternary. Reset is handled by toggling the class off:

```jsx
<form className={shake ? 'animate-shake' : ''}>
```

---

## 11. Inline Style Rules

The goal is zero inline `style={{}}` for static values. The only legitimate uses are:

| Allowed | Reason |
|---|---|
| Complex background gradients (`linear-gradient`, `radial-gradient`) | Not expressible in Tailwind JIT |
| `boxShadow` values with specific numeric tuning | Beyond Tailwind's shadow token range |
| Dynamic colours driven by runtime data (stage colour, category colour, chart colour) | Cannot be static class names |
| `animationDelay` on stagger items | Must be computed per-index |
| Icon container `background` / `color` received as dynamic props | Component prop-driven |
| `caretColor` on specialised inputs | One-off caret colouring |
| Width percentages for split-panel layouts (`width: '46%'`) | Arbitrary split not in scale |

Everything else: use a Tailwind class or a globals.css `@layer components` entry.

**Do not** create a `BRAND` constants file or a centralised colours object. Token names in JSX are the contract.

---

## 12. Icons

Library: **lucide-react** — consistent across all pages.

### Size Conventions

| Context | Size |
|---|---|
| Micro / caption-level | 12–13px |
| Form field icons, badges | 14px |
| Button icons, input toggles | 15–17px |
| Section card header icons | 16px (in 32×32 container) |
| Callout / action icons | 18–20px |
| Hero / empty-state icons | 24–32px |

### Colour

Icons inherit text colour from className. Always colour via Tailwind:

```jsx
<AlertCircle size={14} className="text-hig-red shrink-0" />
<Shield size={13} className="text-hig-gray-3" />
<Zap size={12} className="text-hig-orange" />
```

---

## 13. Page Layout Patterns

### Standard Content Page

```jsx
<div className="max-w-[680px] mx-auto">
  <div className="mb-7">
    <h1 className="text-[26px] font-bold text-hig-text leading-tight">{title}</h1>
    <p className="text-hig-subhead text-hig-text-secondary mt-1">{subtitle}</p>
  </div>
  {/* content */}
</div>
```

### Two-Column Form Page (Add / Edit)

```jsx
<div className="flex gap-7 items-start">
  <div className="flex-1 min-w-0">
    {/* main form */}
  </div>
  <div className="hidden lg:block w-[300px] shrink-0">
    {/* preview / summary sidebar */}
  </div>
</div>
```

### Split-Panel Auth Page (Login)

```jsx
<div className="min-h-screen flex font-sans">
  <div className="hidden lg:flex flex-col relative overflow-hidden"
       style={{ width: '46%', background: 'linear-gradient(…)' }}>
    {/* branding */}
  </div>
  <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-12">
    {/* form */}
  </div>
</div>
```

---

## 14. Do / Don't Summary

| ✅ Do | ❌ Don't |
|---|---|
| Use hig-* tokens for all colour | Hardcode `#2E96FF` or similar in JSX |
| Use `hover:` Tailwind classes | Use `onMouseEnter`/`onMouseLeave` for visual state |
| Use `hig-card`, `hig-input`, `hig-btn-*` | Re-implement card/input styles inline |
| Use `hig-label` for form labels | Use `style={{ fontSize: 13, fontWeight: 600 }}` etc. |
| Add keyframes to `tailwind.config.js` or `globals.css` | Add `<style>` blocks inside JSX files |
| Keep dynamic (data-driven) colours inline | Force dynamic colours into static Tailwind classes |
| Use `animate-fade-up` + `animationDelay` for stagger | Use custom CSS classes for stagger |
| Use `focus-within:` for field-group focus | Use JS focus/blur handlers for styling |
| Use `active:scale-[0.98]` on buttons | Implement press effect in JS |
| Use `transition-colors` or `transition-all duration-hig` | Skip transitions on interactive elements |
| Extend globals.css `@layer components` for reusable patterns | Create one-off utility files or BRAND constants |

---

*Last updated: 2026-05-03 · Covers all pages refactored through v1.0*
