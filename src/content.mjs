// =============================================================================
// 간다GO · 본문 콘텐츠 조합기
// 지역 속성(생활권/역/숙소유형/권역 타입)을 조합해 페이지마다 다른 본문 생성.
// "지역명만 바꾼 복붙" 방지 — 타입별 서술과 실제 지역 데이터가 결합된다.
// =============================================================================
import { AREAS, CITIES, USE_PAGES, CHECK_PAGES, STATIONS, COURSES } from "./data.mjs";
import { esc } from "./render.mjs";

const areaBySlug = Object.fromEntries(AREAS.map((a) => [a.slug, a]));
const cityBySlug = Object.fromEntries(CITIES.map((c) => [c.slug, c]));

const list = (arr) => arr.map(esc).join(", ");

// 숙소 유형별 이용 기준 문구
const STAY_TEXT = {
  hotel: "호텔·숙소는 프런트 위치, 객실 층, 주차 진입 방식을 먼저 확인합니다. 성수기나 관광철에는 로비 혼잡과 주차 대기가 생길 수 있어 예약 시간에 여유를 두는 편이 안전합니다.",
  officetel: "오피스텔은 공동현관 비밀번호, 동·호수, 관리실 운영 시간을 확인해야 합니다. 야간에는 공동현관 출입 방식이 달라지는 건물이 있어 예약 전 확인이 필요합니다.",
  "apartment-home": "아파트·자택은 공동현관·주차 등록·동선을 미리 확인합니다. 방문 주소와 동호수가 정확해야 이동 시간이 정확히 계산됩니다.",
  "beach-accommodation": "동해안 해안 숙소는 성수기 진입 도로 정체와 주차 공간이 변수입니다. 해변 인접 펜션·호텔은 객실 위치와 진입로를 함께 확인합니다.",
  pension: "펜션·독채 숙소는 출입 방식, 주차, 객실 위치, 야간 진입 가능 여부가 도심 숙소와 다릅니다. 외진 곳은 이동 시간이 길어질 수 있어 예약 시간을 미리 조율합니다.",
  resort: "리조트는 동·층 위치와 단지 내 이동 동선이 넓어 객실 위치 확인이 중요합니다. 시즌권 성수기에는 단지 진입과 주차에 시간이 더 걸립니다.",
  "ski-resort": "스키장·리조트는 겨울 성수기 진입 정체와 결빙 도로가 변수입니다. 야간·심야 이동은 도로 상황에 따라 시간이 크게 달라질 수 있습니다.",
  "border-area": "접경·군부대 인접권은 정확한 주소와 진입 가능 여부 확인이 우선입니다. 얇은 읍면 단위보다 외곽 이동 기준으로 안내합니다.",
  "outer-area": "산간·외곽 지역은 이동 거리와 도로 사정에 따라 예약 가능 시간이 제한될 수 있습니다. 겨울철에는 별도 도로 확인이 필요합니다.",
  night: "야간 예약은 이동 시간과 도로 상황을 먼저 확인합니다. 산간·외곽은 심야 이동이 제한되는 구간이 있습니다.",
  "ktx-station": "KTX·터미널 인접 숙소는 접근성이 좋지만 역 주변 주차와 도보 동선을 확인해야 합니다.",
  "winter-road": "겨울철에는 산간 도로 결빙·적설로 이동 시간이 달라집니다. 예약 전 도로 상황을 별도로 확인합니다.",
};

// 권역 타입별 도입 서술 (2문장)
function typeIntro(type, name, zonesText) {
  switch (type) {
    case "city":
      return `${name}은 강원 내륙의 도심 생활권으로, 주거지·상권·역세권이 함께 있는 지역입니다. ${zonesText} 등 생활권마다 이동 동선과 주차 환경이 다르므로, 방문 주소와 이용 장소를 먼저 확인하는 것이 좋습니다.`;
    case "coastal":
      return `${name}은 동해안 해안 생활권으로, 관광 숙소와 펜션·호텔 이용 수요가 많은 지역입니다. ${zonesText} 등 해변 인접 숙소는 성수기 진입 도로와 주차가 변수여서 예약 시간에 여유를 두는 편이 안전합니다.`;
    case "resort":
      return `${name}은 산악·리조트 생활권으로, 스키장·리조트·펜션 이용 기준이 도심 지역과 다릅니다. ${zonesText} 등 단지형 숙소는 객실 위치와 진입 동선이 넓어 확인 항목이 많고, 겨울철 이동 시간이 크게 달라집니다.`;
    case "border":
      return `${name}은 접경·군부대 인접 생활권으로, 세부 읍면을 무리하게 나누기보다 정확한 주소와 외곽 이동 가능 여부를 먼저 확인하는 것이 중요합니다. ${zonesText} 중심으로 방문 가능 여부를 안내합니다.`;
    default:
      return `${name}은 내륙·외곽 관광 숙소권으로, 펜션·리조트·동강 관광 숙소가 중심입니다. ${zonesText} 등은 검색 수요가 큰 도심 상권보다 숙소 유형과 이동 기준 확인이 먼저입니다.`;
  }
}

// 타입별 지역 성격 보충 서술
function typeCharacter(type, name) {
  switch (type) {
    case "city":
      return `${name}은 대학가·상권·주거 단지와 관광 숙소가 섞여 있어, 같은 시내라도 낮 시간과 저녁 시간의 이동 흐름이 다릅니다. 오피스텔과 아파트가 많은 구역은 공동현관 출입 방식이 건물마다 달라, 예약 전 동·호수와 출입 방법을 함께 확인하는 것이 이동 시간을 정확히 잡는 방법입니다.`;
    case "coastal":
      return `${name}은 해안선을 따라 호텔·펜션·리조트가 넓게 흩어져 있어, 같은 지역명이라도 해변 인접 숙소와 시내 숙소의 진입 방식이 다릅니다. 여름 성수기와 주말에는 해안도로 정체와 주차난이 이동 시간을 늘리므로, 예약 시간대와 진입로를 미리 확인하는 편이 안전합니다.`;
    case "resort":
      return `${name}은 대형 리조트와 스키장 단지가 이동 기준을 좌우합니다. 단지 안에서도 동과 층에 따라 진입 동선이 길고, 성수기 시즌권 기간에는 단지 진입·주차 자체에 시간이 걸립니다. 겨울철에는 산악 도로 상황이 이동 시간을 크게 바꿔, 숙소 유형과 함께 도로 상황을 확인해야 합니다.`;
    case "border":
      return `${name}은 접경·군부대 인접 특성이 강해, 검색 수요가 큰 도심처럼 세부 읍면을 촘촘히 나누는 것은 오히려 얇은 페이지를 늘릴 뿐입니다. 이 지역은 정확한 방문 주소, 진입 가능 여부, 예약 가능 시간, 숙소 형태를 먼저 확인하고, 외곽 이동 기준으로 방문 여부를 안내하는 편이 정확합니다.`;
    default:
      return `${name}은 관광·펜션·캠핑 숙소가 흩어진 내륙 외곽권으로, 이동 거리가 지역마다 편차가 큽니다. 도심 상권 중심이 아니라 숙소 유형과 진입 도로, 이동 시간 확인이 예약의 핵심이며, 검색 수요가 약한 외곽 읍면은 상위 생활권 기준으로 안내합니다. 동강 주변 관광 숙소나 캠핑형 독채는 진입로가 좁고 야간 이동이 제한되는 곳이 있어, 방문 주소와 진입 방식을 예약 전에 함께 확인하는 것이 좋습니다.`;
  }
}

// 타입별 겨울철·외곽 이동 서술
function typeMobility(type, name) {
  switch (type) {
    case "resort":
      return `${name}은 겨울철 이동 관리가 특히 중요합니다. 스키장·리조트 방향 도로는 적설과 결빙으로 이동 시간이 평소보다 크게 늘어날 수 있고, 심야 이동이 제한되는 구간이 생깁니다. 예약 전 겨울철 도로·날씨 확인 페이지에서 도로 상황을 별도로 점검하세요.`;
    case "border":
      return `${name} 외곽·접경 방향은 이동 거리가 길고 도로 사정에 따라 예약 가능 시간이 제한될 수 있습니다. 야간 예약은 이동 가능 여부를 먼저 확인하며, 겨울철에는 도로 결빙으로 이동 시간이 달라집니다.`;
    case "coastal":
      return `${name}은 해안도로 정체가 주요 변수입니다. 성수기와 주말 저녁에는 이동 시간이 늘어날 수 있고, 외곽 펜션은 진입로가 좁은 곳이 있어 야간 이동 가능 여부를 확인합니다. 겨울에는 해안·산간 경계 구간 도로 상황을 별도로 확인합니다.`;
    default:
      return `${name} 외곽이나 산간 방향은 도심 생활권보다 이동 시간이 길어질 수 있습니다. 이동 거리, 도로 사정, 예약 가능 시간대를 함께 확인하며, 야간 예약은 이동 가능 여부를 먼저 확인합니다. 겨울철에는 도로 결빙·적설로 이동 시간이 달라질 수 있습니다.`;
  }
}

// 상단 요금 섹션(메인·주요 페이지 재사용)
export function pricingSection() {
  return `<section class="section"><div class="wrap center">
  <span class="eyebrow">이용 코스와 요금</span>
  <h2>이용 코스와 요금 살펴보기</h2>
  <p class="lead" style="margin-inline:auto">60·90·120분 코스별 기준 요금이며, 추가 비용 없이 있는 그대로 안내해 드립니다.</p>
  <div class="pricing" style="margin-top:34px">
  ${COURSES.map((c) => `
    <div class="price${c.feature ? " price--feature" : ""}">
      ${c.feature ? '<span class="price__badge">추천</span>' : ""}
      <div class="price__name">${esc(c.name)}</div>
      <div class="price__amount">${esc(c.price)}<small>원</small></div>
      <div class="price__min">${esc(c.min)}</div>
      <div class="price__desc">${esc(c.desc)}</div>
      <a class="btn ${c.feature ? "btn--accent" : "btn--ghost"} btn--lg" style="width:100%" href="tel:0508-202-4719">예약 문의</a>
    </div>`).join("")}
  </div>
  <p class="muted" style="margin-top:22px;font-size:.9rem">지역·예약 시간대·이동 거리에 따라 상담 시 최종 확인됩니다. <a href="/gangwon/check/travel-fee/">상세 요금 안내 보기 →</a></p>
</div></section>`;
}

// ---- 시·군 상세 페이지 본문 ----
export function cityBody(city) {
  const area = areaBySlug[city.area];
  const zonesText = list(city.zones);
  const stationText = city.stations.length
    ? `가까운 거점은 ${list(city.stations)}이며, KTX·터미널 인접 숙소는 접근성이 좋은 대신 역 주변 주차와 도보 동선을 확인합니다.`
    : `${city.name}은 KTX 역이 가깝지 않은 지역이라, 상위 생활권과 인근 터미널·주요 국도를 기준으로 이동 시간을 확인합니다. 접경·산간 방향은 도로 사정에 따라 예약 가능 시간이 제한될 수 있어, 방문 주소와 진입 가능 여부를 먼저 확인하는 것이 중요합니다.`;
  const stayText = [...new Set(city.stay)].map((s) => `<li><strong>${esc(USE_PAGES.find((u) => u.slug === s)?.name || s)}</strong> — ${esc(STAY_TEXT[s] || "")}</li>`).join("");

  // 롱테일 내부링크: 같은 권역 다른 시군 + 이용 장소 + 예약 확인
  const siblings = area.cities.filter((s) => s !== city.slug).map((s) => cityBySlug[s]).filter(Boolean);
  const related = [
    ...siblings.map((s) => ({ url: `/gangwon/${s.slug}/`, anchor: `${s.name} ${s.zones[0]} 숙소 이용 안내` })),
    { url: `/gangwon/area/${area.slug}/`, anchor: `${area.name} 생활권 전체 보기` },
    ...[...new Set(city.stay)].slice(0, 2).map((s) => ({ url: `/gangwon/use/${s}/`, anchor: `${USE_PAGES.find((u) => u.slug === s)?.name} 이용 기준 확인` })),
    { url: "/gangwon/check/address/", anchor: `${city.name} 방문 주소 확인 기준` },
    { url: "/gangwon/check/winter-road/", anchor: "겨울철 도로·날씨 확인 안내" },
  ];

  const faqs = [
    { q: `${city.name} 전 지역 방문이 가능한가요?`, a: "실제 방문 주소, 가까운 생활권, 예약 가능 시간, 이동 거리, 숙소 형태를 확인한 뒤 안내합니다." },
    { q: `${city.name}은 어떤 숙소 확인이 중요한가요?`, a: `${city.name}은 ${city.zones[0]} 등 생활권과 ${USE_PAGES.find((u) => u.slug === city.stay[0])?.name} 이용 기준을 함께 확인하는 것이 좋습니다.` },
    { q: "겨울철에는 별도 확인이 필요한가요?", a: "강원도 산간·외곽은 겨울철 도로와 이동 시간이 달라질 수 있어 예약 전 확인 페이지에서 별도로 안내합니다." },
    { q: "불법·선정적 서비스도 가능한가요?", a: "불법·선정적 서비스는 제공하거나 안내하지 않습니다." },
  ];

  const body = `
<section class="section"><div class="wrap">
  <span class="eyebrow">${esc(area.name)}</span>
  <h1>${esc(city.h1)}</h1>
  <div class="prose">
    <p>${esc(typeIntro(city.type, city.name, zonesText))}</p>
    <p>${esc(typeCharacter(city.type, city.name))}</p>

    <h2>상위 권역 속 ${esc(city.name)}의 위치</h2>
    <p>${esc(city.name)}은 <strong>${esc(area.name)}</strong>에 속하며, 이 권역은 ${esc(list(area.includes))} 지역을 함께 안내합니다. 인접 지역과 이동 동선이 이어지는 경우가 많아, ${esc(city.name)} 단독으로만 보지 않고 상위 권역의 숙소 유형과 이동 기준을 함께 확인하면 예약이 더 정확해집니다.</p>

    <h2>${esc(city.name)} 대표 생활권</h2>
    <p>${esc(city.name)}의 주요 생활권은 <strong>${zonesText}</strong>입니다. 같은 ${esc(city.name)} 안에서도 상권 중심지와 외곽 주거지, 관광 숙소 밀집 구역은 이동 시간과 주차 환경이 다릅니다. 방문 전에는 어느 생활권에 위치한 숙소인지, 건물 형태가 무엇인지를 먼저 확인하는 것이 예약을 정확하게 진행하는 방법입니다. 특히 ${esc(city.zones[0])} 방면은 유동 인구가 많아 시간대에 따라 진입과 주차 여건이 달라질 수 있습니다.</p>

    <h2>가까운 역·터미널</h2>
    <p>${esc(stationText)} 역·터미널 인접 숙소는 접근성이 좋지만, 출구별·노선별로 페이지를 나누기보다 실제 방문 주소와 숙소 형태를 기준으로 이용 가능 여부를 확인하는 것이 정확합니다.</p>

    <h2>숙소 유형별 이용 기준</h2>
    <p>${esc(city.name)}에서 자주 이용되는 숙소 유형은 아래와 같으며, 유형마다 확인 항목이 다릅니다.</p>
    <ul>${stayText}</ul>

    <h2>외곽·산간·겨울철 이동 기준</h2>
    <p>${esc(typeMobility(city.type, city.name))} 자세한 확인 항목은 <a href="/gangwon/check/winter-road/">겨울철 도로·날씨 확인</a>과 <a href="/gangwon/check/night-travel/">야간 이동 가능 여부</a> 페이지에서 안내합니다.</p>

    <h2>예약 전 확인 요약</h2>
    <p>방문 주소와 건물 형태, 공동현관·객실 출입 방식, 주차 가능 여부, 예약 가능 시간과 변경 기준, 그리고 <a href="/gangwon/check/privacy/">개인정보 처리 기준</a>을 확인합니다. 확인이 끝나면 <a href="tel:0508-202-4719">전화예약 0508-202-4719</a>로 방문 가능 여부를 안내받을 수 있습니다. ${esc(SITE_LINE)}</p>
  </div>
</div></section>`;

  return { body, faqs, related, context: city.name };
}

const SITE_LINE = `본 안내는 방문 가능 지역과 숙소 이용 기준을 설명하며, 불법·선정적 서비스는 제공·안내하지 않습니다.`;

// ---- 광역 생활권 페이지 본문 ----
export function areaBody(area) {
  const cities = area.cities.map((s) => cityBySlug[s]).filter(Boolean);
  const zonesText = list(area.zones);
  const stayNames = [...new Set(cities.flatMap((c) => c.stay))]
    .map((s) => USE_PAGES.find((u) => u.slug === s)?.name)
    .filter(Boolean)
    .join(", ");
  const cityCards = cities.map((c) => `
    <a class="card card--link" href="/gangwon/${c.slug}/">
      <span class="card__tag">${esc(c.zones[0])}</span>
      <h3>${esc(c.name)}</h3>
      <p>${esc(c.desc)}</p>
      <span class="card__link">이용 기준 보기 →</span>
    </a>`).join("");

  const related = [
    ...cities.map((c) => ({ url: `/gangwon/${c.slug}/`, anchor: `${c.name} ${c.zones[0]} 이용 안내` })),
    { url: "/gangwon/", anchor: "강원도 7대 생활권 전체 보기" },
    { url: "/gangwon/check/time/", anchor: "예약 가능 시간 확인" },
  ];

  const faqs = [
    { q: `${area.name}은 어떻게 나뉘나요?`, a: `${area.name}은 ${list(area.includes)} 지역을 포함하며, 도심 생활권·관광 숙소·외곽 이동 기준으로 나누어 안내합니다.` },
    { q: "지역명보다 무엇을 먼저 확인하나요?", a: "강원도는 호텔·펜션·리조트·해안 숙소 등 이용 환경이 달라, 지역명보다 숙소 유형과 이동 기준 확인이 먼저입니다." },
    { q: `${area.name} 외곽·읍면 지역도 안내하나요?`, a: `검색 수요가 약한 외곽 읍면은 얇은 페이지를 늘리지 않고, 상위 생활권이나 숙소 유형 페이지로 연결해 이동 기준을 안내합니다. 방문 여부는 실제 주소와 예약 조건 확인 후 안내합니다.` },
    { q: "불법·선정적 서비스도 가능한가요?", a: "불법·선정적 서비스는 제공하거나 안내하지 않습니다." },
  ];

  const cityLines = cities
    .map((c) => `<li><strong>${esc(c.name)}</strong> — ${esc(c.zones.slice(0, 3).join(", "))} 중심으로 ${esc(USE_PAGES.find((u) => u.slug === c.stay[0])?.name || "숙소")} 이용 기준을 안내합니다.</li>`)
    .join("");

  const body = `
<section class="section"><div class="wrap">
  <span class="eyebrow">7대 광역 생활권</span>
  <h1>${esc(area.h1)}</h1>
  <div class="prose">
    <p>${esc(typeIntro(area.type, area.name, zonesText))}</p>
    <p>${esc(typeCharacter(area.type, area.name))}</p>
    <p>이 권역은 <strong>${list(area.includes)}</strong>을 포함하며, 대표 생활권으로는 ${zonesText} 등이 있습니다. 각 지역은 도심 생활권·관광 숙소·외곽 이동 기준이 서로 다르므로, 지역명 반복보다 숙소 유형과 이동 기준을 기준으로 방문 가능 여부를 확인하는 것이 정확합니다.</p>
    <p>대표 생활권을 기준으로 보면, ${esc(area.zones[0])} 방면은 유동 인구와 상권이 형성된 중심 구역이고, ${esc(area.zones[area.zones.length - 1])} 방면은 외곽·관광 숙소 성격이 강해 이동 시간과 진입 방식이 다릅니다. 따라서 같은 ${esc(area.name)} 안에서도 방문 주소가 어느 생활권에 속하는지, 건물이 호텔·펜션·리조트·오피스텔 중 무엇인지에 따라 예약 전 확인 항목이 달라집니다. 아래 시·군 안내와 이용 장소 페이지에서 상황에 맞는 기준을 확인하세요.</p>

    <h2>${esc(area.name)} 시·군 안내</h2>
    <ul>${cityLines}</ul>

    <h2>이 권역의 대표 숙소 유형</h2>
    <p>${esc(area.name)}에서 주로 이용되는 숙소는 ${esc(stayNames)}입니다. ${esc(typeMobility(area.type, area.name))} 같은 권역이라도 숙소 유형에 따라 확인 항목이 다르므로, 아래 시·군 카드에서 실제 이용 장소를 선택해 세부 이용 기준을 확인하세요.</p>

    <h2>이 권역을 이용할 때 확인할 점</h2>
    <p>${esc(area.name)}에서는 예약 전 방문 주소와 건물 형태, 공동현관·객실 출입 방식, 주차 가능 여부, 외곽·야간 이동 가능 시간을 확인하는 것이 좋습니다. 겨울철에는 도로 상황에 따라 이동 시간이 달라질 수 있어 <a href="/gangwon/check/winter-road/">겨울철 도로·날씨 확인</a> 기준을 함께 안내합니다. 검색 수요가 약한 외곽 읍면은 얇은 페이지를 늘리지 않고 상위 생활권 또는 숙소 유형 페이지로 연결하며, 불법·선정적 서비스는 제공·안내하지 않고 방문 여부는 실제 주소·예약 조건 확인 후 안내합니다.</p>
  </div>
  <div class="grid grid--3" style="margin-top:26px">${cityCards}</div>
</div></section>`;

  return { body, faqs, related, context: area.name };
}

// ---- 이용 장소 페이지 본문 ----
export function useBody(use) {
  const key = use.slug;
  const relatedCities = CITIES.filter((c) => c.stay.includes(key)).slice(0, 6);
  const related = [
    ...relatedCities.map((c) => ({ url: `/gangwon/${c.slug}/`, anchor: `${c.name} ${use.name} 이용 안내` })),
    { url: "/gangwon/check/address/", anchor: "방문 주소 확인 기준" },
    { url: "/gangwon/check/building-access/", anchor: "건물 출입 방식 확인" },
  ];
  const faqs = [
    { q: `${use.name} 시 무엇을 먼저 확인하나요?`, a: STAY_TEXT[key] || "방문 주소, 출입 방식, 주차, 예약 가능 시간을 먼저 확인합니다." },
    { q: "예약 시간은 어떻게 정하나요?", a: "이용 장소와 이동 거리에 따라 예약 가능 시간이 달라질 수 있어 상담 시 확인합니다." },
  ];
  const body = `
<section class="section"><div class="wrap">
  <span class="eyebrow">이용 장소 안내</span>
  <h1>${esc(use.name)} 이용 기준</h1>
  <div class="prose">
    <p>${esc(STAY_TEXT[key] || "")}</p>
    <h2>확인 항목</h2>
    <ul>
      <li><strong>방문 주소</strong> — 건물명·동호수까지 정확히 확인합니다.</li>
      <li><strong>출입 방식</strong> — 공동현관·프런트·객실 출입 방식을 확인합니다.</li>
      <li><strong>주차·진입</strong> — 차량 진입과 주차 가능 여부를 확인합니다.</li>
      <li><strong>예약 시간</strong> — 이동 거리에 따라 가능 시간대를 확인합니다.</li>
    </ul>
    <p>${esc(SITE_LINE)} 자세한 기준은 <a href="/gangwon/check/address/">방문 주소 확인</a>과 <a href="/gangwon/check/time/">예약 가능 시간</a> 페이지에서 확인할 수 있습니다.</p>
  </div>
</div></section>`;
  return { body, faqs, related, context: use.name };
}

// ---- 예약 전 확인 페이지 본문 ----
const CHECK_TEXT = {
  address: "예약을 정확히 진행하려면 방문 주소를 건물명과 동·호수까지 확인해야 합니다. 도로명 주소와 실제 건물 위치가 다른 경우가 있어, 지도상 위치와 출입구 방향을 함께 확인하면 이동 시간이 정확해집니다.",
  "building-access": "공동현관 비밀번호, 엘리베이터 이용 방식, 야간 출입 방식은 건물마다 다릅니다. 오피스텔·아파트는 관리실 운영 시간에 따라 출입 방식이 바뀔 수 있어 예약 전 확인이 필요합니다.",
  "pension-policy": "펜션·독채 숙소는 대문·현관 출입 방식, 주차 위치, 객실이 단지 내 어디에 있는지 확인해야 합니다. 외진 곳은 진입로가 좁거나 야간 이동이 제한될 수 있습니다.",
  "resort-policy": "리조트는 동·층·객실 번호와 단지 내 이동 동선을 확인합니다. 시즌 성수기에는 단지 진입과 주차에 시간이 더 걸립니다.",
  "hotel-policy": "호텔은 프런트 위치, 객실 층, 주차 방식, 방문 정책을 확인합니다. 관광철에는 로비 혼잡이 있을 수 있어 예약 시간에 여유를 둡니다.",
  "officetel-rule": "오피스텔은 공동현관·관리실 규정과 야간 출입 방식을 확인합니다. 동·호수가 정확해야 이동 시간이 정확히 계산됩니다.",
  "travel-fee": "강원도는 도심·해안·산간·접경권이 함께 있어 이동 거리 편차가 큽니다. 외곽·산간은 이동 거리에 따라 기준이 달라질 수 있어 상담 시 확인합니다.",
  "night-travel": "야간·심야 예약은 이동 시간과 도로 상황을 먼저 확인합니다. 산간·외곽은 심야 이동이 제한되는 구간이 있습니다.",
  "winter-road": "강원도 산간은 겨울철 도로 결빙·적설로 이동 시간이 달라집니다. 대관령·정선·태백·인제 방향은 예약 전 도로 상황을 별도로 확인합니다.",
  time: "예약 가능 시간대는 지역과 이동 거리에 따라 달라집니다. 도심 생활권은 비교적 유연하지만, 외곽·산간은 이동 시간을 감안해 시간대를 확인합니다.",
  "change-policy": "예약 변경은 시간 조정 가능 범위를 미리 확인합니다. 이동 준비가 진행된 이후에는 조정이 제한될 수 있습니다.",
  privacy: "예약 확인과 연락에 필요한 최소 정보만 확인하며, 목적 외로 사용하지 않습니다. 상담 종료 후에는 보관 필요가 없는 정보를 지체 없이 파기하는 것을 원칙으로 합니다.",
  "service-policy": "본 사이트는 방문형 웰니스 이용 전 확인사항을 안내합니다. 불법·선정적 서비스는 제공하거나 안내하지 않으며, 그러한 문의에는 응하지 않습니다.",
  "customer-notice": "예약 전 방문 주소·이용 장소·예약 시간·이동 기준을 확인하면 오안내를 줄일 수 있습니다. 확인이 어려운 경우 상담 시 함께 점검합니다.",
};

export function checkBody(chk) {
  const t = CHECK_TEXT[chk.slug] || "";
  const related = [
    { url: "/gangwon/check/address/", anchor: "방문 주소 확인 기준" },
    { url: "/gangwon/check/time/", anchor: "예약 가능 시간 확인" },
    { url: "/gangwon/check/privacy/", anchor: "개인정보 처리 기준" },
    { url: "/gangwon/check/service-policy/", anchor: "불법·선정적 서비스 불가 안내" },
    { url: "/gangwon/", anchor: "강원도 홈으로" },
  ].filter((l) => l.url !== `/gangwon/check/${chk.slug}/`);
  const body = `
<section class="section"><div class="wrap">
  <span class="eyebrow">예약 전 확인</span>
  <h1>${esc(chk.name)}</h1>
  <div class="prose" style="max-width:70ch">
    <p>${esc(t)}</p>
    <div class="notice" style="margin:22px 0">${esc(SITE_LINE)}</div>
    <p>예약 전 확인이 끝나면 <a href="tel:0508-202-4719">전화예약 ${esc("0508-202-4719")}</a> 또는 <a href="/gangwon/contact/">문의하기</a>에서 방문 가능 여부를 확인할 수 있습니다.</p>
  </div>
</div></section>`;
  const faqs = [];
  return { body, faqs, related, context: chk.name };
}

// ---- 역/터미널 거점 본문 ----
export function stationBody(st) {
  const city = cityBySlug[st.city];
  const related = [
    { url: `/gangwon/${city.slug}/`, anchor: `${city.name} 생활권 이용 안내` },
    { url: `/gangwon/use/ktx-station/`, anchor: "KTX·터미널 인접 숙소 이용 기준" },
    { url: "/gangwon/check/address/", anchor: "방문 주소 확인 기준" },
  ];
  const body = `
<section class="section"><div class="wrap">
  <span class="eyebrow">교통 거점</span>
  <h1>${esc(st.name)} 인접 숙소 이용 안내</h1>
  <div class="prose" style="max-width:70ch">
    <p>${esc(st.name)}은 ${esc(city.name)} 생활권과 연결되는 교통 거점입니다. 역·터미널 인접 숙소는 접근성이 좋은 대신, 주변 주차와 도보 동선, 야간 이용 시 출입 방식을 확인하는 것이 좋습니다. 출구별·노선별 안내 대신 실제 방문 주소와 숙소 형태를 기준으로 이용 가능 여부를 확인합니다.</p>
    <p>자세한 이용 기준은 <a href="/gangwon/use/ktx-station/">KTX·터미널 인접 이용</a>과 <a href="/gangwon/${city.slug}/">${esc(city.name)} 생활권 안내</a>에서 확인하세요.</p>
  </div>
</div></section>`;
  return { body, faqs: [], related, context: st.name };
}
