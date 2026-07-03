// =============================================================================
// 간다GO · 정적 사이트 빌드
// 실행: node src/build.mjs  → 저장소 루트에 HTML/사이트맵/robots 생성
// =============================================================================
import { writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE } from "./config.mjs";
import { AREAS, CITIES, USE_PAGES, CHECK_PAGES, STATIONS, COURSES } from "./data.mjs";
import { LIFE_ZONES } from "./zones.mjs";
import {
  page, esc, whwBlock, faqBlock, checklistBlock, relatedBlock, clampDesc, visibleText, willIndex,
} from "./render.mjs";
import {
  pricingSection, cityBody, areaBody, useBody, checkBody, stationBody, lifeBody,
} from "./content.mjs";

const cityBySlug = Object.fromEntries(CITIES.map((c) => [c.slug, c]));
const corpus = []; // {url, text} — 근접 중복(도어웨이) 검사용

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const written = []; // {url, priority, changefreq}

function emit(url, html, { priority = 0.6, changefreq = "monthly", index = true } = {}) {
  const rel = url === "/" ? "index.html" : url.replace(/^\//, "").replace(/\/$/, "") + "/index.html";
  const out = join(ROOT, rel);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  if (index) written.push({ url, priority, changefreq });
}

// 상세페이지 공통 조립 (본문 + 체크리스트 + FAQ + WHW + 관련링크)
function detail({ url, title, desc, crumbs, built, priority = 0.6, withChecklist = true, canonicalUrl }) {
  const body =
    built.body +
    (withChecklist ? checklistBlock() : "") +
    faqBlock(built.faqs) +
    whwBlock(built.context) +
    relatedBlock(built.related);
  const indexed = willIndex({ url, body, canonicalUrl });
  const html = page({ url, title, desc, crumbs, faqs: built.faqs, body, canonicalUrl });
  // 도어웨이 검사는 실제 색인되는 페이지의 고유 본문(built.body)만 비교
  //  → noindex 얇은 허브(역/터미널)·canonical 통합 페이지는 제외
  if (indexed) corpus.push({ url, text: visibleText(built.body) });
  emit(url, html, { priority, index: indexed });
}

const HOME_CRUMB = { name: "강원도 홈", url: "/gangwon/" };

// ---------------------------------------------------------------------------
// 1) 루트 → /gangwon/ 리다이렉트
// ---------------------------------------------------------------------------
emit("/", `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<title>${esc(SITE.name)} · ${esc(SITE.region)} 지역 안내</title>
<meta name="description" content="${esc(clampDesc(SITE.region + " 출장마사지·홈타이 생활권별 방문 가능 지역 안내"))}">
<link rel="canonical" href="${SITE.domain}/gangwon/">
<meta http-equiv="refresh" content="0; url=/gangwon/">
</head><body><p><a href="/gangwon/">강원도 지역 안내로 이동</a></p></body></html>`, { index: false });

// ---------------------------------------------------------------------------
// 2) 메인 페이지 /gangwon/
// ---------------------------------------------------------------------------
const areaCards = AREAS.map((a) => `
  <a class="card card--link" href="/gangwon/area/${a.slug}/">
    <span class="card__tag">${esc(a.includes.join(" · "))}</span>
    <h3>${esc(a.name)}</h3>
    <p>${esc(a.zones.slice(0, 3).join(", "))} 등</p>
    <span class="card__link">생활권 보기 →</span>
  </a>`).join("");

const cityChips = CITIES.map((c) => `<a href="/gangwon/${c.slug}/">${esc(c.name)}</a>`).join("");

const stayFeature = [
  { url: "/gangwon/use/beach-accommodation/", t: "강릉 경포·안목 해안 숙소" },
  { url: "/gangwon/use/beach-accommodation/", t: "속초 대포항·설악동 숙소" },
  { url: "/gangwon/use/beach-accommodation/", t: "양양 낙산·인구 해변 숙소" },
  { url: "/gangwon/use/ski-resort/", t: "평창 용평·대관령 리조트" },
  { url: "/gangwon/use/ski-resort/", t: "정선 하이원 인접 숙소" },
  { url: "/gangwon/use/resort/", t: "홍천 비발디파크 인접 숙소" },
  { url: "/gangwon/use/resort/", t: "횡성 웰리힐리 인접 숙소" },
  { url: "/gangwon/use/pension/", t: "강원도 펜션·독채 숙소" },
].map((s) => `<a class="card card--link" href="${s.url}"><h3>${esc(s.t)}</h3><span class="card__link">이용 기준 →</span></a>`).join("");

const homeFaqs = [
  { q: "강원도 전 지역 방문이 가능한가요?", a: "실제 방문 주소, 가까운 생활권, 예약 가능 시간, 이동 거리, 숙소 형태를 확인한 뒤 안내합니다." },
  { q: "강원도는 도시보다 숙소 유형 확인이 중요한가요?", a: "네. 강원도는 호텔, 펜션, 리조트, 스키장, 해안 숙소, 산간 외곽 숙소처럼 이용 환경이 달라 숙소 유형 확인이 중요합니다." },
  { q: "춘천·원주·강릉은 1차 핵심 지역인가요?", a: "네. 춘천, 원주, 강릉은 도심 생활권과 교통 거점이 뚜렷해 1차 핵심 페이지로 구성합니다." },
  { q: "펜션이나 독채 숙소에서도 이용할 수 있나요?", a: "숙소 출입 방식, 주차, 객실 위치, 야간 이동 가능 여부, 예약 가능 시간을 먼저 확인해야 합니다." },
  { q: "겨울철에는 별도 확인이 필요한가요?", a: "네. 강원도 산간 지역은 겨울철 도로와 이동 시간이 달라질 수 있어 예약 전 확인 페이지에서 별도로 안내합니다." },
  { q: "불법·선정적 서비스도 가능한가요?", a: "불법·선정적 서비스는 제공하거나 안내하지 않습니다." },
];

const homeBody = `
<section class="hero"><div class="wrap">
  <span class="eyebrow">강원특별자치도 · 방문형 웰니스 지역 안내</span>
  <h1>강원도 출장마사지 · 관광 숙소와<br>생활권별 방문 가능 지역 안내</h1>
  <p class="hero__sub">춘천, 원주, 강릉, 속초, 평창, 정선, 동해, 삼척, 홍천 등 강원도 주요 생활권과 호텔·펜션·리조트·KTX 인접 숙소 이용 전 확인사항을 안내합니다.</p>
  <div class="hero__cta">
    <a class="btn btn--accent btn--lg" href="tel:0508-202-4719">전화예약 ${esc(SITE.phone)}</a>
    <a class="btn btn--lg" href="/gangwon/area/gangneung-donghae-samcheok/">동해안 숙소 보기</a>
    <a class="btn btn--lg btn--ghost" href="/gangwon/check/time/">예약 전 확인</a>
  </div>
</div></section>

<section class="section--tight"><div class="wrap">
  <h2>강원도는 지역명보다 숙소 유형과 이동 기준이 먼저입니다</h2>
  <p class="lead">강원도는 도심 생활권, 동해안 숙소, 산간 리조트, 펜션, 접경지역, KTX 거점이 함께 있는 지역입니다. 같은 강원도라도 춘천·원주처럼 도심형 지역과 속초·양양처럼 해안 숙소형 지역, 평창·정선처럼 리조트형 지역은 예약 전 확인 기준이 다릅니다.</p>
</div></section>

<section class="section--tight"><div class="wrap">
  <h2>강원도 7대 생활권 안내</h2>
  <div class="grid grid--3" style="margin-top:20px">${areaCards}</div>
</div></section>

<section class="section--tight"><div class="wrap">
  <h2>핵심 시·군 안내</h2>
  <div class="related" style="margin-top:16px">${cityChips}</div>
</div></section>

<section class="section--tight"><div class="wrap">
  <h2>관광 숙소·리조트·펜션 안내</h2>
  <div class="grid grid--4" style="margin-top:20px">${stayFeature}</div>
</div></section>

${pricingSection()}
${checklistBlock()}
`;

emit("/gangwon/", page({
  url: "/gangwon/",
  title: "강원도 출장마사지｜춘천·원주·강릉·속초·평창 홈타이 지역 안내",
  desc: "강원도 출장마사지·홈타이 춘천·원주·강릉·속초·평창 생활권과 숙소 이용 기준 안내.",
  crumbs: [HOME_CRUMB],
  faqs: homeFaqs,
  body: homeBody + faqBlock(homeFaqs) + whwBlock("강원도"),
}), { priority: 1.0, changefreq: "weekly" });

// ---------------------------------------------------------------------------
// 3) 광역 생활권 7
// ---------------------------------------------------------------------------
for (const a of AREAS) {
  detail({
    url: `/gangwon/area/${a.slug}/`,
    title: a.title, desc: a.desc,
    crumbs: [HOME_CRUMB, { name: a.name, url: `/gangwon/area/${a.slug}/` }],
    built: areaBody(a), priority: 0.8, withChecklist: true,
  });
}

// ---------------------------------------------------------------------------
// 4) 18개 시·군
// ---------------------------------------------------------------------------
for (const c of CITIES) {
  const a = AREAS.find((x) => x.slug === c.area);
  detail({
    url: `/gangwon/${c.slug}/`,
    title: c.title, desc: c.desc,
    crumbs: [HOME_CRUMB, { name: a.name, url: `/gangwon/area/${a.slug}/` }, { name: c.name, url: `/gangwon/${c.slug}/` }],
    built: cityBody(c), priority: c.tier === 1 ? 0.8 : 0.6,
  });
}

// ---------------------------------------------------------------------------
// 5) 이용 장소
// ---------------------------------------------------------------------------
for (const u of USE_PAGES) {
  detail({
    url: `/gangwon/use/${u.slug}/`,
    title: u.title, desc: u.desc,
    crumbs: [HOME_CRUMB, { name: "이용 장소", url: "/gangwon/use/hotel/" }, { name: u.name, url: `/gangwon/use/${u.slug}/` }],
    built: useBody(u), priority: 0.6, withChecklist: false,
  });
}

// ---------------------------------------------------------------------------
// 6) 예약 전 확인
// ---------------------------------------------------------------------------
for (const k of CHECK_PAGES) {
  detail({
    url: `/gangwon/check/${k.slug}/`,
    title: k.title, desc: k.desc,
    crumbs: [HOME_CRUMB, { name: "예약 전 확인", url: "/gangwon/check/time/" }, { name: k.name, url: `/gangwon/check/${k.slug}/` }],
    built: checkBody(k), priority: 0.5, withChecklist: false,
  });
}

// ---------------------------------------------------------------------------
// 7) 교통 거점
// ---------------------------------------------------------------------------
for (const s of STATIONS) {
  detail({
    url: `/gangwon/station/${s.slug}/`,
    title: `${s.name} 인접 숙소 이용 안내｜간다GO`,
    desc: clampDesc(`${s.name} 인접 숙소 이용 시 주차·출입·예약 시간 확인 기준 안내.`),
    crumbs: [HOME_CRUMB, { name: "교통 거점", url: "/gangwon/station/chuncheon-station/" }, { name: s.name, url: `/gangwon/station/${s.slug}/` }],
    built: stationBody(s), priority: 0.5, withChecklist: false,
  });
}

// ---------------------------------------------------------------------------
// 7-b) 핵심 생활권 (life zone)
//   index:false 인 얇은 외곽 생활권은 상위 시·군으로 canonical 통합(도어웨이 방지)
// ---------------------------------------------------------------------------
for (const z of LIFE_ZONES) {
  const city = cityBySlug[z.city];
  const area = AREAS.find((a) => a.slug === city.area);
  const canonicalUrl = z.index ? undefined : `/gangwon/${city.slug}/`;
  detail({
    url: `/gangwon/life/${z.slug}/`,
    title: `${z.name} 출장마사지 이용 안내｜${city.name} 생활권`,
    desc: clampDesc(`${z.name} 생활권과 숙소 이용 기준·이동 확인 안내.`),
    crumbs: [HOME_CRUMB, { name: area.name, url: `/gangwon/area/${area.slug}/` }, { name: city.name, url: `/gangwon/${city.slug}/` }, { name: z.name, url: `/gangwon/life/${z.slug}/` }],
    built: lifeBody(z), priority: z.index ? 0.7 : 0.4, withChecklist: true, canonicalUrl,
  });
}

// ---------------------------------------------------------------------------
// 8) 정적 페이지: 작성자·검수자 / 문의 / 사이트맵 페이지
// ---------------------------------------------------------------------------
const authorBody = `
<section class="section"><div class="wrap">
  <span class="eyebrow">운영 기준</span>
  <h1>작성자·검수자 안내</h1>
  <div class="prose" style="max-width:70ch">
    <p>본 사이트의 지역 안내 콘텐츠는 강원특별자치도 공식 행정구역 자료와 주요 생활권 구조를 바탕으로 작성됩니다. AI 보조 도구를 활용할 수 있으나, 최종 문구는 운영자가 직접 검수하여 중복·과장·허위 표현을 제거합니다.</p>
    <h2>편집·검수 원칙</h2>
    <ul>
      <li>지역명만 바꾼 복제 문장을 사용하지 않습니다.</li>
      <li>가짜 후기·허위 평점·과장 표현을 사용하지 않습니다.</li>
      <li>불법·선정적 서비스를 제공하거나 암시하지 않습니다.</li>
      <li>실제 오프라인 매장이 없는 방문형 서비스이므로 LocalBusiness 스키마를 사용하지 않습니다.</li>
    </ul>
    <h2>연락</h2>
    <p>상호 ${esc(SITE.name)} · 전화예약 <a href="tel:0508-202-4719">${esc(SITE.phone)}</a></p>
  </div>
</div></section>`;
emit("/gangwon/author/", page({
  url: "/gangwon/author/", title: "작성자·검수자 안내｜간다GO",
  desc: clampDesc("간다GO 지역 안내 콘텐츠 작성·검수 원칙과 운영 기준 안내."),
  crumbs: [HOME_CRUMB, { name: "작성자·검수자 안내", url: "/gangwon/author/" }],
  body: authorBody + whwBlock("강원도"),
}), { priority: 0.4 });

const contactBody = `
<section class="section"><div class="wrap">
  <span class="eyebrow">문의하기</span>
  <h1>예약·문의 안내</h1>
  <div class="prose" style="max-width:70ch">
    <p>방문 가능 여부는 실제 방문 주소, 이용 장소, 예약 가능 시간, 이동 거리를 확인한 뒤 안내해 드립니다. 아래 연락처로 문의해 주세요.</p>
    <div class="notice" style="margin:20px 0">
      <strong>상호</strong> ${esc(SITE.name)}<br>
      <strong>전화예약</strong> <a href="tel:0508-202-4719">${esc(SITE.phone)}</a>
    </div>
    <p>예약 전에는 <a href="/gangwon/check/address/">방문 주소 확인</a>, <a href="/gangwon/check/time/">예약 가능 시간</a>, <a href="/gangwon/check/service-policy/">불법·선정적 서비스 불가 안내</a>를 함께 확인해 주세요.</p>
    <div class="hero__cta" style="margin-top:24px">
      <a class="btn btn--accent btn--lg" href="tel:0508-202-4719">전화예약 ${esc(SITE.phone)}</a>
    </div>
  </div>
</div></section>`;
emit("/gangwon/contact/", page({
  url: "/gangwon/contact/", title: "문의하기｜간다GO 강원도 지역 안내",
  desc: clampDesc(`간다GO 강원도 지역 안내 예약·문의 전화 ${SITE.phone}.`),
  crumbs: [HOME_CRUMB, { name: "문의하기", url: "/gangwon/contact/" }],
  body: contactBody,
}), { priority: 0.6 });

// HTML 사이트맵 페이지
const smSections = [
  { h: "7대 광역 생활권", items: AREAS.map((a) => ({ url: `/gangwon/area/${a.slug}/`, n: a.name })) },
  { h: "시·군 안내", items: CITIES.map((c) => ({ url: `/gangwon/${c.slug}/`, n: c.name })) },
  { h: "핵심 생활권", items: LIFE_ZONES.filter((z) => z.index).map((z) => ({ url: `/gangwon/life/${z.slug}/`, n: z.name })) },
  { h: "이용 장소", items: USE_PAGES.map((u) => ({ url: `/gangwon/use/${u.slug}/`, n: u.name })) },
  { h: "예약 전 확인", items: CHECK_PAGES.map((k) => ({ url: `/gangwon/check/${k.slug}/`, n: k.name })) },
  { h: "교통 거점", items: STATIONS.map((s) => ({ url: `/gangwon/station/${s.slug}/`, n: s.name })) },
];
const smBody = `
<section class="section"><div class="wrap">
  <span class="eyebrow">사이트맵</span>
  <h1>전체 지역·페이지 보기</h1>
  ${smSections.map((s) => `<h2>${esc(s.h)}</h2><div class="related" style="margin-bottom:24px">${s.items.map((i) => `<a href="${i.url}">${esc(i.n)}</a>`).join("")}</div>`).join("")}
</div></section>`;
emit("/gangwon/sitemap-page/", page({
  url: "/gangwon/sitemap-page/", title: "사이트맵｜간다GO 강원도 지역 안내",
  desc: clampDesc("간다GO 강원도 지역 안내 전체 페이지·지역 목록 사이트맵."),
  crumbs: [HOME_CRUMB, { name: "사이트맵", url: "/gangwon/sitemap-page/" }],
  body: smBody,
}), { priority: 0.3 });

// ---------------------------------------------------------------------------
// 9) sitemap.xml + robots.txt
// ---------------------------------------------------------------------------
const urlset = written
  .map((w) => `  <url><loc>${SITE.domain}${w.url}</loc><changefreq>${w.changefreq}</changefreq><priority>${w.priority.toFixed(1)}</priority></url>`)
  .join("\n");
writeFileSync(join(ROOT, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlset}\n</urlset>\n`);

writeFileSync(join(ROOT, "robots.txt"),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE.domain}/sitemap.xml\n`);

// ---------------------------------------------------------------------------
// 10) 근접 중복(도어웨이) 검사 — 단독 색인 페이지 본문 간 Jaccard 유사도
//     지역명만 바꾼 복붙(도어웨이)이 있으면 높은 유사도로 드러난다.
// ---------------------------------------------------------------------------
function shingles(text, n = 3) {
  const toks = text.split(/\s+/).filter((t) => t.length > 1);
  const set = new Set();
  for (let i = 0; i + n <= toks.length; i++) set.add(toks.slice(i, i + n).join(" "));
  return set;
}
function jaccard(a, b) {
  let inter = 0;
  for (const s of a) if (b.has(s)) inter++;
  return inter / (a.size + b.size - inter || 1);
}
const shings = corpus.map((c) => ({ url: c.url, s: shingles(c.text) }));
const WARN = 0.35;
const pairs = [];
for (let i = 0; i < shings.length; i++)
  for (let j = i + 1; j < shings.length; j++) {
    const sim = jaccard(shings[i].s, shings[j].s);
    if (sim >= WARN) pairs.push({ a: shings[i].url, b: shings[j].url, sim });
  }
pairs.sort((x, y) => y.sim - x.sim);

console.log(`✅ 빌드 완료 — 색인 페이지 ${written.length}개, sitemap.xml / robots.txt 생성`);
console.log(`🔎 도어웨이 검사 — 단독 색인 본문 ${corpus.length}개, 3-그램 Jaccard ≥ ${WARN} 페어: ${pairs.length}`);
if (pairs.length) {
  for (const p of pairs.slice(0, 12)) console.log(`   ⚠️  ${p.sim.toFixed(2)}  ${p.a}  ↔  ${p.b}`);
  console.log("   → 위 페어는 본문이 유사합니다. 고유 콘텐츠로 차별화하거나 canonical 통합을 검토하세요.");
} else {
  console.log("   ✓ 근접 중복 없음 (지역명 복붙형 도어웨이 미탐지)");
}
const maxSim = shings.length > 1 ? Math.max(...(() => { const arr=[]; for(let i=0;i<shings.length;i++)for(let j=i+1;j<shings.length;j++)arr.push(jaccard(shings[i].s,shings[j].s)); return arr.length?arr:[0]; })()) : 0;
console.log(`   최고 유사도: ${maxSim.toFixed(3)}`);
