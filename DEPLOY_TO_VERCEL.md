# Hi Care — GitHub + Vercel + Supabase 배포 순서

Supabase 프로젝트: `https://qgszvmlrqcafrgenusdj.supabase.co`
(URL과 publishable key는 `client/src/lib/supabase.ts`에 기본값으로 들어 있어 Vercel 환경변수 없이도 동작합니다.)

## 1. Supabase — SQL 2개 실행 (처음 1회, 순서 중요)
Supabase 대시보드 → **SQL Editor** → New query
1. `supabase/schema.sql` 전체 붙여넣고 **Run** (테이블 + 보안 규칙 생성)
2. `supabase/seed_health_content.sql` 전체 붙여넣고 **Run** (건강 콘텐츠를 DB에 등록)

## 2. Supabase — 인증 설정
**Authentication → URL Configuration**
- Site URL: 배포된 Vercel 주소 (예: `https://xxx.vercel.app`)
- Redirect URLs: 같은 주소 추가 (`http://localhost:5173`도 추가하면 로컬 테스트 가능)

**Authentication → Sign In / Providers → Email**
- `Confirm email` 켜면: 가입 후 메일 인증을 해야 로그인 (스팸 가입 방지, 권장)
- 끄면: 가입 즉시 로그인 (테스트할 때 편함)

## 3. GitHub → Vercel
- 저장소에 push → Vercel에서 Import (Framework: Vite, 설정은 `vercel.json`에 포함)
- push 할 때마다 GitHub **Actions 탭**에서 빌드 검사가 자동 실행됩니다.

## 4. 첫 관리자 만들기
사이트에서 회원가입 → Supabase SQL Editor에서 실행:
```sql
update public.profiles set role = 'admin' where email = '내이메일@example.com';
```
로그인하면 상단에 **관리자** 버튼이 생기고 `/admin`에서 회원 정지/해제, 관리자 지정, 활동 로그를 관리합니다.

## 콘텐츠를 수정하려면
1. `client/public/healthData.json` 수정 (기존 `scripts/`로 수정해도 동일)
2. `npm run seed:content` → `supabase/seed_health_content.sql` 재생성
3. 그 SQL을 Supabase SQL Editor에서 Run
> `healthData.json`은 repo에만 있고 배포 결과물에서는 자동 제거됩니다. (로그인 없이 직접 URL로 받아갈 수 없게 하기 위함)

## 주의
- **`sb_secret_...` / `service_role` 키는 절대 GitHub·코드에 넣지 마세요.** (publishable key만 코드에 있습니다)
- 실제 보안은 DB의 Row Level Security(`schema.sql`)가 담당합니다.
- 로그인 사용자의 "어떤 질환을 조회했는가" 기록은 건강 관련 민감 정보가 될 수 있으니, 정식 운영 전 개인정보처리방침을 마련하세요.
