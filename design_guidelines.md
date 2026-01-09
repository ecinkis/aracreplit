# Design Guidelines: Araç Takası App

## Brand Identity
**Purpose**: Turkey's first swap-focused vehicle marketplace with intelligent matching.

**Aesthetic**: Bold/striking with trust signals. High contrast, clean layouts prioritizing vehicle imagery, trust-building visual language (badges, verified icons), energetic yet professional.

**Key Feature**: Swipe-to-match + real-time compatibility percentage.

## Color System

```javascript
// Primary
PRIMARY_ORANGE: '#FF6B35'  // CTA, active states, match indicators
DEEP_NAVY: '#1A2332'       // Headers, primary text, trust elements

// Secondary
SUCCESS_GREEN: '#00C48C'   // Verified badges, successful match
ALERT_RED: '#FF4757'       // Reject swipe, warnings
SKY_BLUE: '#4A90E2'        // Info elements
WARNING: '#FFA726'

// Neutrals
BG: '#F8F9FA'
SURFACE: '#FFFFFF'
BORDER: '#E5E8EB'
TEXT_PRIMARY: '#1A2332' (90% opacity)
TEXT_SECONDARY: '#6B7280' (60% opacity)
```

## Typography

**Fonts**: Montserrat (headers), Inter (body)

```javascript
H1: { size: 28, weight: 'bold', family: 'Montserrat' }      // Screen titles
H2: { size: 20, weight: '600', family: 'Montserrat' }       // Section headers
BODY: { size: 16, weight: 'regular', family: 'Inter' }      // Primary content
CAPTION: { size: 13, weight: 'regular', family: 'Inter' }   // Metadata, labels
BUTTON: { size: 16, weight: '600', family: 'Montserrat' }
```

## Spacing & Layout

```javascript
SPACING = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 }
BORDER_RADIUS = { cards: 12, buttons: 8, inputs: 8, avatar: '50%' }
SHADOWS = { offset: {width: 0, height: 2}, opacity: 0.10, radius: 2 }
ICONS = { family: 'Feather', size: 24 }
TOUCH_SCALE = 0.95  // Press state for all interactive elements
```

## Navigation Structure

**Bottom Tab Bar** (5 tabs):
1. **Vitrin** (Browse) - Home icon
2. **Match** - Heart/Swap icon  
3. **İlan Ver** (Create) - Plus icon (center, larger, elevated)
4. **Mesajlar** (Messages) - Chat icon + badge
5. **Profil** (Profile) - User icon

Each tab has independent navigation stack.

## Screen Specifications

### Onboarding (One-time Stack)

#### Splash Screen
- Full screen gradient (PRIMARY_ORANGE → DEEP_NAVY)
- Centered logo/name + loading indicator
- No header

#### Phone Verification
- **Header**: "Giriş Yap"
- **Form**: Phone input (+90), SMS code (6 digits, large font)
- **Buttons**: "SMS Gönder", "Doğrula" (full width, PRIMARY_ORANGE)
- **Safe Area**: Top: insets.top + xl, Bottom: insets.bottom + xl

#### Profile Setup (Optional)
- **Header**: "Profil Bilgileri" + "Atla" (right)
- **Form**: Avatar picker (80px circle), Name, City dropdown
- **Button**: "Başla"

---

### Tab 1: Vitrin (Browse)

#### Vitrin Home
- **Header**: Transparent, "Vitrin", "Filtre" icon (right)
- **Layout**: Sticky search bar → "Öne Çıkan İlanlar" carousel → 2-column grid
- **Card Design**:
  ```
  - Image (16:9)
  - Badges: "Ekspertizli", "Acil Takas" (overlay)
  - Marka Model Yıl (bold, 16px)
  - KM + Lokasyon (caption, gray)
  - Takas Uyum: 85% (colored bar)
  ```
- **Safe Area**: Top: headerHeight + xl, Bottom: tabBarHeight + xl
- **Empty**: "empty-vitrin.png"

#### Listing Detail
- **Header**: Back + "Favori" + "Paylaş" (right)
- **Sections**:
  1. Image carousel (full width, swipeable)
  2. Vehicle specs card (grid: Brand, Model, Year, KM, Fuel, Transmission, Location)
  3. Takas Tercihleri (chips: accepted brands, cash policy)
  4. User card (avatar, name, trust score, "Mesaj Gönder" button)

#### Filter Modal
- **Bottom sheet**: "Filtrele" header, "İptal" (left), "Uygula" (right)
- **Filters**: Marka, Model, Yıl (slider), KM (slider), Şehir, Yakıt (chips), Vites (chips), Ekspertizli (toggle)

---

### Tab 2: Match

#### Match Screen
- **Header**: Transparent, "Eşleşmeler", "Filtreler" icon (right)
- **Card Stack** (Tinder-style):
  ```
  - Full-screen vehicle image
  - Gradient overlay (bottom)
  - White text: Marka Model Yıl (28px bold), KM + Lokasyon
  - Takas Uyum: 85% (large colored badge)
  - User avatar (small, bottom left)
  - Cards remaining count (top)
  ```
- **Floating Actions** (bottom):
  - Red X (60px, reject)
  - Yellow Star (50px, favorite)
  - Green Heart (60px, match)
- **Swipe Overlays**: Left (red tint), Right (green tint), Up (yellow tint)
- **Safe Area**: Bottom: tabBarHeight + xl + 80px
- **Empty**: "empty-matches.png"

#### Match Success Modal
- **Full screen**: "Eşleşme! 🎉" (large, centered)
- **Content**: Side-by-side vehicle images
- **Buttons**: "Mesaja Git" (PRIMARY_ORANGE), "Devam Et" (text)
- **Animation**: Confetti

---

### Tab 3: İlan Ver (Create)

#### Quick Listing Form
- **Header**: "Hızlı İlan Ver", "İptal" (left), "Kaydet" (right)
- **Progress Indicator** at top
- **Form Steps**:
  1. Photos (grid, 3-10)
  2. Marka, Model, Yıl, KM
  3. Yakıt, Vites (chips)
  4. Konum (auto-detect + edit)
  5. Takas preferences (radio: Sadece Takas/Takas+Nakit, multi-select brands)
  6. "Takas İçin Aktif" toggle (ON default)
- **Submit**: "İlanı Yayınla" (sticky bottom, PRIMARY_ORANGE)

---

### Tab 4: Mesajlar

#### Messages List
- **Header**: "Mesajlar"
- **Rows**: Avatar, name, last message, timestamp, unread badge
- **Swipe Actions**: Archive, Delete
- **Empty**: "empty-messages.png"

#### Chat Screen
- **Header**: Back + user avatar/name + menu (block/report)
- **Bubbles**: Sent (PRIMARY_ORANGE), Received (Light Gray)
- **Input Bar**: Text field, photo button, send button (PRIMARY_ORANGE)
- **Safe Area**: Bottom: insets.bottom + xl

---

### Tab 5: Profil

#### Profile Home
- **Header**: "Profil", "Ayarlar" icon (right)
- **Profile Card**:
  ```
  - Avatar (100px)
  - Name, phone (masked)
  - Güven Skoru: 85/100 (progress ring)
  - "Telefon Doğrulandı ✓" badge
  ```
- **Stats Row**: İlanlarım (5/5), Eşleşmeler (12), Favoriler (8)
- **Sections**: "İlanlarım" (grid + "Yeni İlan Ekle" if < 5), "Eşleşmelerim" (horizontal scroll), "Favorilerim" (horizontal scroll)

#### Settings Screen
- **Header**: "Ayarlar" + back
- **Grouped List**:
  - Hesap: Profil düzenle, Telefon değiştir
  - Bildirimler: Push, SMS toggles
  - Gizlilik: Telefon gizle toggle
  - Yardım: SSS, İletişim
  - Çıkış Yap (red)

## Required Assets

| Asset | Size | Usage | Description |
|-------|------|-------|-------------|
| **icon.png** | 1024x1024 | App icon | "TK" monogram/swap arrows, PRIMARY_ORANGE bg, DEEP_NAVY icon |
| **splash-icon.png** | 512x512 | Splash screen | Same as app icon |
| **empty-vitrin.png** | 800x600 | Vitrin empty state | Parked cars, "Henüz ilan yok" |
| **empty-matches.png** | 800x600 | Match empty state | Two cars + dashed line, "Şu an için uygun araç yok" |
| **empty-messages.png** | 800x600 | Messages empty | Chat bubble, "Henüz mesajınız yok" |
| **default-avatar.png** | 200x200 | User placeholder | Circular silhouette, light gray |
| **default-vehicle.png** | 400x300 | Vehicle placeholder | Side-view car silhouette, gray on white |

**Illustration Style**: Minimal, flat design with PRIMARY_ORANGE accents, consistent brand colors.

## Accessibility & Best Practices

- Minimum touch target: 44x44px
- Color contrast ratio: 4.5:1 (text), 3:1 (UI components)
- All images require alt text
- Form inputs need labels (visible or aria-label)
- Use semantic headings (H1 once per screen)
- Support dynamic text sizing
- Provide haptic feedback for swipe actions
- Loading states for all async operations
- Error states with actionable messages