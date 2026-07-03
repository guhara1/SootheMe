// =============================================================================
// 간다GO · 본문 콘텐츠 조합기
// 지역 속성(생활권/역/숙소유형/권역 타입)을 조합해 페이지마다 다른 본문 생성.
// "지역명만 바꾼 복붙" 방지 — 타입별 서술과 실제 지역 데이터가 결합된다.
// =============================================================================
import { AREAS, CITIES, USE_PAGES, CHECK_PAGES, STATIONS, COURSES } from "./data.mjs";
import { LIFE_ZONES } from "./zones.mjs";
import { esc } from "./render.mjs";

const areaBySlug = Object.fromEntries(AREAS.map((a) => [a.slug, a]));
const cityBySlug = Object.fromEntries(CITIES.map((c) => [c.slug, c]));
const zonesByCity = LIFE_ZONES.reduce((m, z) => ((m[z.city] ??= []).push(z), m), {});

// 시·군별 고유 성격 서술(실제 지리·특징) — 같은 타입 페이지가 복붙처럼 보이지
// 않도록 각 도시의 실제 특징을 본문 앞에 배치한다(도어웨이 방지).
const CITY_FEATURES = {
  "chuncheon-si": "춘천시는 소양강과 의암호를 낀 강원 영서 내륙의 중심 도시로, 강원대·한림대 대학가와 명동 닭갈비 상권, 남춘천역 역세권이 함께 있습니다. 호수 관광과 도심 생활권이 붙어 있어 시간대별 이동 흐름 차이가 큰 편입니다.",
  "wonju-si": "원주시는 강원 최대 인구 도시이자 공공기관이 이전한 혁신도시와 지정면 기업도시를 품은 산업·행정 거점입니다. KTX 원주역과 신도심 무실·단계 상권을 중심으로 업무·출장 이동 수요가 많습니다.",
  "gangneung-si": "강릉시는 KTX 강릉역과 경포·안목 해변, 커피거리, 교동 상권이 어우러진 동해안 대표 관광·교통 도시입니다. 시내 생활권과 해안 관광권의 이동·주차 여건이 뚜렷이 다릅니다.",
  "sokcho-si": "속초시는 설악산과 동해를 함께 낀 관광 도시로, 대포항·속초해변·중앙시장·설악동 숙박권이 좁은 시가지에 밀집해 있습니다. 성수기 시내 도로 정체가 이동 시간을 좌우합니다.",
  "donghae-si": "동해시는 묵호항 논골담길과 망상해변 같은 해안 관광과 항만·산업이 공존하는 도시입니다. 천곡 도심과 묵호 항구권의 진입로·주차 성격이 서로 다릅니다.",
  "samcheok-si": "삼척시는 삼척해변과 쏠비치 리조트, 죽서루, 삼척항을 낀 동해안 남부 관광 도시입니다. 대규모 해안 리조트와 도심 상권이 함께 있어 숙소 유형별 확인 항목이 갈립니다.",
  "taebaek-si": "태백시는 황지연못(낙동강 발원지)과 매봉산 바람의언덕을 낀 국내 최고지대 산악 도시입니다. 고지대·겨울 눈 특성상 계절에 따라 이동 시간이 크게 달라집니다.",
  "hongcheon-gun": "홍천군은 전국에서 면적이 가장 넓은 군으로, 비발디파크·오션월드 리조트와 홍천강·수타사 관광이 흩어져 있습니다. 리조트 배후권과 외곽 펜션권의 이동 거리 편차가 큽니다.",
  "pyeongchang-gun": "평창군은 2018 동계올림픽 개최지로 대관령·용평·휘닉스파크·알펜시아 리조트와 봉평 메밀꽃마을을 낀 산악 관광지입니다. 고지대 리조트 단지 이동과 겨울 도로 관리가 핵심입니다.",
  "jeongseon-gun": "정선군은 강원랜드·하이원리조트와 정선아리랑·레일바이크·정선5일장으로 알려진 산간 관광 군입니다. 고한·사북 고지대 생활권과 리조트 진입 동선이 이동 기준을 좌우합니다.",
  "yangyang-gun": "양양군은 죽도·인구 서핑 해변과 낙산사·낙산해변, 남대천 연어로 알려진 서핑 1번지입니다. 서핑 시즌 해변권 숙소 수요가 계절에 따라 크게 몰립니다.",
  "goseong-gun": "고성군은 화진포·통일전망대·아야진을 낀 최북단 접경 해안 군입니다. 속초와 이어지는 토성 해안 펜션권과 간성·거진 북부권의 이동 거리가 다릅니다.",
  "hoengseong-gun": "횡성군은 횡성한우와 웰리힐리파크, 안흥찐빵으로 알려진 영서 내륙 군입니다. 둔내 고원 리조트권과 읍내·외곽의 이동 시간 차이가 큽니다.",
  "inje-gun": "인제군은 내설악·백담사·자작나무숲을 낀 산악 접경 군으로, 원통(북면) 일대 군부대 접경권이 특징입니다. 산간·접경 이동 특성상 야간 이동 제한 구간이 있습니다.",
  "cheorwon-gun": "철원군은 한탄강·고석정·노동당사·DMZ 안보관광을 낀 접경 군입니다. 동송·갈말 생활권을 중심으로 정확한 주소와 접경 진입 가능 여부 확인이 먼저입니다.",
  "hwacheon-gun": "화천군은 산천어축제와 파로호·평화의댐으로 알려진 접경 군입니다. 화천읍 축제권과 사내면 사창리 군부대 접경권의 성격이 다릅니다.",
  "yanggu-gun": "양구군은 국토정중앙과 펀치볼·을지전망대를 낀 접경 산악 군입니다. 양구읍 중심 생활권과 접경 외곽의 이동 거리를 나누어 확인합니다.",
  "yeongwol-gun": "영월군은 단종 유배지 장릉·청령포와 동강 래프팅, 별마로천문대로 알려진 내륙 관광 군입니다. 읍내 유적권과 동강 캠핑·펜션권의 진입로가 서로 다릅니다.",
};

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

// 권역별 고유 성격 서술(실제 특징) — 광역 생활권 페이지 차별화
const AREA_FEATURES = {
  "chuncheon-hongcheon": "춘천·홍천권은 소양강·의암호를 낀 춘천 도심 생활권과, 비발디파크·오션월드로 대표되는 홍천 리조트권이 한 권역에 묶인 곳입니다. 대학가·역세권 도심과 서울 접근성 좋은 대형 리조트가 함께 있어 성격이 뚜렷이 갈립니다.",
  "wonju-hoengseong": "원주·횡성권은 혁신도시·기업도시와 KTX 원주역을 낀 원주 도심권과, 웰리힐리파크·횡성한우로 알려진 횡성 고원 리조트권이 이어지는 곳입니다. 업무·출장 수요가 큰 도심과 고랭지 리조트 이동 기준이 함께 필요합니다.",
  "gangneung-donghae-samcheok": "강릉·동해·삼척권은 KTX 강릉역·경포·안목을 낀 강릉, 묵호항·망상의 동해, 쏠비치·삼척해변의 삼척으로 이어지는 동해안 중부 해안 벨트입니다. 관광 해변과 항만·리조트가 촘촘히 붙어 성수기 해안도로 흐름이 이동을 좌우합니다.",
  "sokcho-yangyang-goseong": "속초·양양·고성권은 설악산·대포항의 속초, 서핑 해변 죽도·인구의 양양, 화진포·통일전망대의 고성으로 이어지는 동해안 북부권입니다. 관광 숙소·서핑 숙소·접경 해안 펜션까지 숙소 성격이 다양합니다.",
  "pyeongchang-jeongseon-taebaek": "평창·정선·태백권은 동계올림픽 개최지 평창(대관령·용평·휘닉스파크)과 강원랜드·하이원의 정선, 국내 최고지대 태백으로 이어지는 산악 리조트 벨트입니다. 고지대·겨울 도로 관리가 이동 기준의 핵심입니다.",
  "cheorwon-hwacheon-yanggu-inje": "철원·화천·양구·인제권은 한탄강·DMZ 안보관광의 철원, 산천어축제의 화천, 국토정중앙의 양구, 내설악·백담사의 인제로 이어지는 접경·군부대 인접 벨트입니다. 세부 읍면보다 정확한 주소와 외곽 이동 가능 여부 확인이 먼저입니다.",
  "yeongwol-south-inland": "영월·남부 내륙권은 단종 유적 장릉·청령포와 동강 래프팅의 영월을 중심으로 제천 인접 내륙 관광 숙소가 흩어진 권역입니다. 도심 상권보다 펜션·캠핑 숙소와 외곽 진입 도로 확인이 중요합니다. 동강 주변 독채·캠핑 숙소는 진입로가 좁고 야간 이동이 제한되는 곳이 있어, 방문 주소와 진입 방식을 예약 전에 함께 확인하는 편이 안전하며, 별마로천문대·주천 방면처럼 외곽으로 갈수록 이동 시간을 넉넉히 잡아야 합니다.",
};

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
  <p class="muted" style="margin-top:22px;font-size:.9rem">지역·예약 시간대·이동 거리에 따라 상담 시 최종 확인됩니다. <a href="/check/travel-fee/">상세 요금 안내 보기 →</a></p>
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
    ...siblings.map((s) => ({ url: `/${s.slug}/`, anchor: `${s.name} ${s.zones[0]} 숙소 이용 안내` })),
    { url: `/area/${area.slug}/`, anchor: `${area.name} 생활권 전체 보기` },
    ...[...new Set(city.stay)].slice(0, 2).map((s) => ({ url: `/use/${s}/`, anchor: `${USE_PAGES.find((u) => u.slug === s)?.name} 이용 기준 확인` })),
    { url: "/check/address/", anchor: `${city.name} 방문 주소 확인 기준` },
    { url: "/check/winter-road/", anchor: "겨울철 도로·날씨 확인 안내" },
  ];

  const faqs = [
    { q: `${city.name} 전 지역 방문이 가능한가요?`, a: "실제 방문 주소, 가까운 생활권, 예약 가능 시간, 이동 거리, 숙소 형태를 확인한 뒤 안내합니다." },
    { q: `${city.name}은 어떤 숙소 확인이 중요한가요?`, a: `${city.name}은 ${city.zones[0]} 등 생활권과 ${USE_PAGES.find((u) => u.slug === city.stay[0])?.name} 이용 기준을 함께 확인하는 것이 좋습니다.` },
    { q: "겨울철에는 별도 확인이 필요한가요?", a: "강원도 산간·외곽은 겨울철 도로와 이동 시간이 달라질 수 있어 예약 전 확인 페이지에서 별도로 안내합니다." },
    { q: "불법·선정적 서비스도 가능한가요?", a: "불법·선정적 서비스는 제공하거나 안내하지 않습니다." },
  ];

  // 이 도시의 실제 대표 지점(생활권 DB에서 수집) — 도시별 고유 지명 주입
  const cityZones = zonesByCity[city.slug] || [];
  const landmarks = [...new Set(cityZones.flatMap((z) => z.landmarks))];
  const landmarkText = landmarks.length
    ? `대표 지점으로는 <strong>${landmarks.slice(0, 6).map(esc).join(", ")}</strong> 등이 있어, 방문 주소가 어느 지점과 가까운지에 따라 이동 동선과 주차 여건이 달라집니다.`
    : `${esc(city.name)} 안에서도 상권 중심과 외곽 주거지는 이동 동선과 주차 여건이 다릅니다.`;
  const lifeLinks = cityZones.filter((z) => z.index).slice(0, 4)
    .map((z) => `<a href="/life/${z.slug}/">${esc(z.name)}</a>`).join(", ");
  const lifeLine = lifeLinks
    ? `세부 생활권은 ${lifeLinks} 페이지에서 각각의 이용 기준을 확인할 수 있습니다.`
    : "";
  const feature = CITY_FEATURES[city.slug] || typeCharacter(city.type, city.name);
  // 도시별 생활권 특징(생활권 DB의 실제 성격·메모) — 도시 고유성 강화
  const zoneBreakdown = cityZones.length
    ? `<ul>${cityZones.map((z) => `<li><strong>${esc(z.name)}</strong> — ${esc(z.character)}. ${esc(z.note)}</li>`).join("")}</ul>`
    : "";

  const body = `
<section class="section"><div class="wrap">
  <span class="eyebrow">${esc(area.name)}</span>
  <h1>${esc(city.h1)}</h1>
  <div class="prose">
    <p>${esc(feature)}</p>
    ${(city.type === "border") ? "" : `<p>${esc(typeIntro(city.type, city.name, zonesText))}</p>`}

    <h2>${esc(city.name)} 대표 생활권과 지점</h2>
    <p>${esc(city.name)}의 주요 생활권은 <strong>${zonesText}</strong>입니다. ${landmarkText} ${lifeLine} 방문 전에는 어느 생활권에 위치한 숙소인지, 건물 형태가 무엇인지를 먼저 확인하는 것이 예약을 정확하게 진행하는 방법입니다.</p>
    ${zoneBreakdown}

    <h2>상위 권역 속 위치와 가까운 역·터미널</h2>
    <p>${esc(city.name)}은 <strong>${esc(area.name)}</strong>에 속하며, 이 권역은 ${esc(list(area.includes))} 지역을 함께 안내합니다. ${esc(stationText)} 인접 지역과 이동 동선이 이어지는 경우가 많아, 상위 권역의 숙소 유형과 이동 기준을 함께 확인하면 예약이 더 정확해집니다.</p>

    <h2>숙소 유형별 이용 기준</h2>
    ${(city.type === "border")
      ? `<p>${esc(city.name)}에서는 ${esc([...new Set(city.stay)].map((s) => USE_PAGES.find((u) => u.slug === s)?.name).filter(Boolean).join(", "))} 기준을 주로 확인합니다. 접경·외곽 특성상 숙소 유형보다 정확한 주소와 진입 가능 여부가 먼저이며, 세부 기준은 <a href="/use/outer-area/">외곽 지역 이용</a>과 <a href="/use/border-area/">군부대·접경권 인접 이용</a> 페이지에서 확인할 수 있습니다.</p>`
      : `<p>${esc(city.name)}에서 자주 이용되는 숙소 유형은 아래와 같으며, 유형마다 확인 항목이 다릅니다.</p>\n    <ul>${stayText}</ul>`}

    <h2>외곽·산간·겨울철 이동 기준</h2>
    ${(city.type === "border") && landmarks.length
      ? `<p>${esc(city.name)}은 ${esc(landmarks.slice(0, 3).join(", "))} 방면처럼 지점에 따라 진입 도로와 이동 거리가 크게 벌어집니다. 특히 ${esc(landmarks[0])} 주변과 외곽 방향은 도심 기준과 이동 시간이 달라, 예약 시 정확한 방문 주소와 진입 가능 여부, 야간 이동 가능 시간을 먼저 확인하는 편이 정확합니다. 겨울철에는 도로 결빙으로 이동 시간이 더 달라질 수 있어 <a href="/check/winter-road/">겨울철 도로·날씨 확인</a> 기준을 함께 봅니다. 검색 수요가 약한 세부 읍면은 얇은 페이지를 만들지 않고 이 시·군 안내 또는 <a href="/use/outer-area/">외곽 지역 이용</a> 기준으로 통합해 관리합니다.</p>`
      : `<p>${esc(typeMobility(city.type, city.name))} 자세한 확인 항목은 <a href="/check/winter-road/">겨울철 도로·날씨 확인</a>과 <a href="/check/night-travel/">야간 이동 가능 여부</a> 페이지에서 안내합니다.</p>`}

    <h2>예약 전 확인 요약</h2>
    <p>방문 주소와 건물 형태, 공동현관·객실 출입 방식, 주차 가능 여부, 예약 가능 시간과 변경 기준, 그리고 <a href="/check/privacy/">개인정보 처리 기준</a>을 확인합니다. 확인이 끝나면 <a href="tel:0508-202-4719">전화예약 0508-202-4719</a>로 방문 가능 여부를 안내받을 수 있습니다. ${esc(SITE_LINE)}</p>
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
    <a class="card card--link" href="/${c.slug}/">
      <span class="card__tag">${esc(c.zones[0])}</span>
      <h3>${esc(c.name)}</h3>
      <p>${esc(c.desc)}</p>
      <span class="card__link">이용 기준 보기 →</span>
    </a>`).join("");

  const related = [
    ...cities.map((c) => ({ url: `/${c.slug}/`, anchor: `${c.name} ${c.zones[0]} 이용 안내` })),
    { url: "/", anchor: "강원도 7대 생활권 전체 보기" },
    { url: "/check/time/", anchor: "예약 가능 시간 확인" },
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
    <p>${esc(AREA_FEATURES[area.slug] || typeCharacter(area.type, area.name))}</p>
    <p>${esc(typeIntro(area.type, area.name, zonesText))}</p>
    <p>이 권역은 <strong>${list(area.includes)}</strong>을 포함하며, 대표 생활권으로는 ${zonesText} 등이 있습니다. 각 지역은 도심 생활권·관광 숙소·외곽 이동 기준이 서로 다르므로, 지역명 반복보다 숙소 유형과 이동 기준을 기준으로 방문 가능 여부를 확인하는 것이 정확합니다.</p>
    <p>대표 생활권을 기준으로 보면, ${esc(area.zones[0])} 방면은 유동 인구와 상권이 형성된 중심 구역이고, ${esc(area.zones[area.zones.length - 1])} 방면은 외곽·관광 숙소 성격이 강해 이동 시간과 진입 방식이 다릅니다. 따라서 같은 ${esc(area.name)} 안에서도 방문 주소가 어느 생활권에 속하는지, 건물이 호텔·펜션·리조트·오피스텔 중 무엇인지에 따라 예약 전 확인 항목이 달라집니다. 아래 시·군 안내와 이용 장소 페이지에서 상황에 맞는 기준을 확인하세요.</p>

    <h2>${esc(area.name)} 시·군 안내</h2>
    <ul>${cityLines}</ul>

    <h2>이 권역의 대표 숙소 유형</h2>
    <p>${esc(area.name)}에서 주로 이용되는 숙소는 ${esc(stayNames)}입니다. ${esc(typeMobility(area.type, area.name))} 같은 권역이라도 숙소 유형에 따라 확인 항목이 다르므로, 아래 시·군 카드에서 실제 이용 장소를 선택해 세부 이용 기준을 확인하세요.</p>

    <h2>이 권역을 이용할 때 확인할 점</h2>
    <p>${esc(area.name)}에서는 예약 전 방문 주소와 건물 형태, 공동현관·객실 출입 방식, 주차 가능 여부, 외곽·야간 이동 가능 시간을 확인하는 것이 좋습니다. 겨울철에는 도로 상황에 따라 이동 시간이 달라질 수 있어 <a href="/check/winter-road/">겨울철 도로·날씨 확인</a> 기준을 함께 안내합니다. 검색 수요가 약한 외곽 읍면은 얇은 페이지를 늘리지 않고 상위 생활권 또는 숙소 유형 페이지로 연결하며, 불법·선정적 서비스는 제공·안내하지 않고 방문 여부는 실제 주소·예약 조건 확인 후 안내합니다.</p>
  </div>
  <div class="grid grid--3" style="margin-top:26px">${cityCards}</div>
</div></section>`;

  return { body, faqs, related, context: area.name };
}

// 이용 장소별 고유 보충 서술 + 고유 확인 항목 (use 페이지 차별화)
const USE_DETAIL = {
  hotel: { p: "호텔·비즈니스 숙소는 강원도 도심과 관광지 전반에 분포합니다. 관광 성수기에는 로비 혼잡과 발렛·주차 대기가 이동 시간을 늘릴 수 있어, 체크인 이후 시간대로 여유를 두는 편이 좋습니다.", li: ["프런트·로비 위치와 객실 층", "지하·외부 주차 진입 방식", "관광철 로비 혼잡 시간대"] },
  pension: { p: "펜션·독채 숙소는 강원 외곽·해안·산간에 많아 진입로와 주차 환경이 도심 숙소와 크게 다릅니다. 단지형 펜션은 객실이 어느 동인지, 개별 독채는 대문·현관 출입 방식이 무엇인지 확인이 필요합니다.", li: ["대문·현관 개별 출입 방식", "단지 내 객실 동 위치", "외진 진입로·야간 이동 가능 여부"] },
  resort: { p: "리조트는 평창·정선·홍천·횡성 등 산악·리조트권에 집중되어 있습니다. 콘도·호텔 동이 여러 개로 나뉘고 단지가 넓어, 같은 리조트라도 동·층에 따라 진입 동선이 길어집니다.", li: ["콘도·호텔 동과 층 위치", "단지 정문·후문 진입 경로", "시즌 성수기 주차·셔틀 동선"] },
  officetel: { p: "오피스텔은 춘천·원주·강릉 등 도심 생활권에 많습니다. 공동현관 비밀번호와 관리실 운영 시간, 야간 출입 방식이 건물마다 달라 예약 전 확인이 특히 중요합니다.", li: ["공동현관 비밀번호·출입 방식", "관리실 운영 시간", "정확한 동·호수"] },
  "apartment-home": { p: "아파트·자택은 방문 주차 등록과 공동현관 출입 방식이 단지마다 다릅니다. 방문 주소의 동·호수가 정확해야 이동 시간이 정확히 계산됩니다.", li: ["방문 차량 주차 등록 방식", "공동현관·엘리베이터 이용", "동·호수와 출입구 방향"] },
  "ktx-station": { p: "KTX·터미널 인접 숙소는 강릉역·원주역·춘천역·속초터미널 등과 가까워 접근성이 좋습니다. 다만 역 주변은 주차가 혼잡하고 도보 동선이 있어, 출구별로 나누기보다 실제 숙소 주소로 확인합니다.", li: ["역·터미널 주변 주차 여건", "숙소까지 도보 동선", "실제 방문 주소 기준 확인"] },
  "beach-accommodation": { p: "동해안 해안 숙소는 강릉 경포·안목, 속초 대포항, 양양 낙산·죽도 등 해변을 낀 곳에 많습니다. 여름 성수기와 주말에는 해안도로 정체와 주차난이 뚜렷해 예약 시간대에 여유가 필요합니다.", li: ["해변 인접 진입로·주차", "성수기 해안도로 정체 시간", "객실이 해변동인지 시내동인지"] },
  "ski-resort": { p: "스키장·리조트는 용평·휘닉스파크·하이원·비발디파크 등 겨울 성수기 수요가 큰 곳입니다. 시즌 진입 도로 정체와 결빙으로 이동 시간이 평소보다 크게 늘어날 수 있습니다.", li: ["겨울 진입 도로 결빙·정체", "리조트 동·층과 셔틀 동선", "심야 이동 제한 여부"] },
  "border-area": { p: "군부대·접경권 인접 숙소는 철원·화천·양구·인제 일대에 있습니다. 정확한 주소와 진입 가능 여부 확인이 우선이며, 얇은 읍면 단위보다 외곽 이동 기준으로 안내합니다.", li: ["정확한 방문 주소·진입 가능 여부", "접경 외곽 이동 거리", "야간 이동 가능 시간"] },
  night: { p: "야간 예약은 이동 시간과 도로 상황을 먼저 확인합니다. 강원도 산간·외곽은 심야에 이동이 제한되는 구간이 있어, 도심권과 외곽권의 가능 시간대가 다릅니다.", li: ["심야 이동 가능 시간대", "산간·외곽 야간 이동 제한", "야간 공동현관 출입 방식"] },
  "outer-area": { p: "외곽 지역은 이동 거리와 도로 사정에 따라 예약 가능 시간이 제한될 수 있습니다. 산간·접경 방향은 도심 기준과 다르게 이동 시간을 넉넉히 잡아야 합니다.", li: ["도심 대비 이동 거리·시간", "진입 도로 상태", "겨울철 별도 도로 확인"] },
  "winter-road": { p: "겨울철에는 대관령·정선·태백·인제 등 산간 도로의 결빙·적설로 이동 시간이 달라집니다. 예약 전 도로 상황을 별도로 확인하는 것이 안전합니다.", li: ["산간 도로 결빙·적설 여부", "제설·통제 구간", "이동 시간 여유 확보"] },
};

// ---- 이용 장소 페이지 본문 ----
export function useBody(use) {
  const key = use.slug;
  const d = USE_DETAIL[key] || { p: STAY_TEXT[key] || "", li: ["방문 주소", "출입 방식", "주차·진입", "예약 시간"] };
  const relatedCities = CITIES.filter((c) => c.stay.includes(key)).slice(0, 6);
  const related = [
    ...relatedCities.map((c) => ({ url: `/${c.slug}/`, anchor: `${c.name} ${use.name} 이용 안내` })),
    { url: "/check/address/", anchor: "방문 주소 확인 기준" },
    { url: "/check/building-access/", anchor: "건물 출입 방식 확인" },
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
    <p>${esc(d.p)}</p>
    <h2>${esc(use.name)} 확인 항목</h2>
    <ul>${d.li.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
    <p>${esc(SITE_LINE)} 자세한 기준은 <a href="/check/address/">방문 주소 확인</a>과 <a href="/check/time/">예약 가능 시간</a> 페이지에서 확인할 수 있습니다.</p>
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
    { url: "/check/address/", anchor: "방문 주소 확인 기준" },
    { url: "/check/time/", anchor: "예약 가능 시간 확인" },
    { url: "/check/privacy/", anchor: "개인정보 처리 기준" },
    { url: "/check/service-policy/", anchor: "불법·선정적 서비스 불가 안내" },
    { url: "/", anchor: "강원도 홈으로" },
  ].filter((l) => l.url !== `/check/${chk.slug}/`);
  const body = `
<section class="section"><div class="wrap">
  <span class="eyebrow">예약 전 확인</span>
  <h1>${esc(chk.name)}</h1>
  <div class="prose" style="max-width:70ch">
    <p>${esc(t)}</p>
    <div class="notice" style="margin:22px 0">${esc(SITE_LINE)}</div>
    <p>예약 전 확인이 끝나면 <a href="tel:0508-202-4719">전화예약 ${esc("0508-202-4719")}</a> 또는 <a href="/contact/">문의하기</a>에서 방문 가능 여부를 확인할 수 있습니다.</p>
  </div>
</div></section>`;
  const faqs = [];
  return { body, faqs, related, context: chk.name };
}

// ---- 역/터미널 거점 본문 ----
export function stationBody(st) {
  const city = cityBySlug[st.city];
  const related = [
    { url: `/${city.slug}/`, anchor: `${city.name} 생활권 이용 안내` },
    { url: `/use/ktx-station/`, anchor: "KTX·터미널 인접 숙소 이용 기준" },
    { url: "/check/address/", anchor: "방문 주소 확인 기준" },
  ];
  const body = `
<section class="section"><div class="wrap">
  <span class="eyebrow">교통 거점</span>
  <h1>${esc(st.name)} 인접 숙소 이용 안내</h1>
  <div class="prose" style="max-width:70ch">
    <p>${esc(st.name)}은 ${esc(city.name)} 생활권과 연결되는 교통 거점입니다. 역·터미널 인접 숙소는 접근성이 좋은 대신, 주변 주차와 도보 동선, 야간 이용 시 출입 방식을 확인하는 것이 좋습니다. 출구별·노선별 안내 대신 실제 방문 주소와 숙소 형태를 기준으로 이용 가능 여부를 확인합니다.</p>
    <p>자세한 이용 기준은 <a href="/use/ktx-station/">KTX·터미널 인접 이용</a>과 <a href="/${city.slug}/">${esc(city.name)} 생활권 안내</a>에서 확인하세요.</p>
  </div>
</div></section>`;
  return { body, faqs: [], related, context: st.name };
}

// ---- 핵심 생활권(life zone) 페이지 본문 ----
export function lifeBody(zone) {
  const city = cityBySlug[zone.city];
  const area = areaBySlug[city.area];
  const lm = zone.landmarks;
  const stayText = [...new Set(zone.stay)]
    .map((s) => `<li><strong>${esc(USE_PAGES.find((u) => u.slug === s)?.name || s)}</strong> — ${esc(STAY_TEXT[s] || "")}</li>`)
    .join("");
  const stationLine = zone.station
    ? `가까운 교통 거점은 <a href="/station/${STATIONS.find((st) => st.name === zone.station)?.slug || ""}/">${esc(zone.station)}</a>이며, 역 인접 숙소는 주차와 도보 동선을 함께 확인합니다.`
    : `이 생활권은 철도 거점이 가깝지 않아, ${esc(city.name)} 시내와 주요 도로를 기준으로 이동 시간을 확인합니다.`;

  // 롱테일 내부링크: 상위 시·군 + 같은 시 다른 생활권 + 이용 장소 + 예약 확인
  const siblings = LIFE_ZONES.filter((z) => z.city === zone.city && z.slug !== zone.slug);
  const related = [
    { url: `/${city.slug}/`, anchor: `${city.name} 생활권 전체 안내` },
    ...siblings.map((z) => ({ url: `/life/${z.slug}/`, anchor: `${z.name} 이용 기준 확인` })),
    ...[...new Set(zone.stay)].slice(0, 2).map((s) => ({ url: `/use/${s}/`, anchor: `${USE_PAGES.find((u) => u.slug === s)?.name} 이용 기준` })),
    { url: `/area/${area.slug}/`, anchor: `${area.name} 보기` },
    { url: "/check/address/", anchor: "방문 주소 확인 기준" },
  ];

  const faqs = [
    { q: `${zone.name}은 어떤 생활권인가요?`, a: `${zone.name}은 ${zone.character}입니다. ${lm.slice(0, 2).join(", ")} 인근을 중심으로 방문 주소와 숙소 유형을 확인해 안내합니다.` },
    { q: `${zone.name}에서 무엇을 먼저 확인하나요?`, a: STAY_TEXT[zone.stay[0]] || "방문 주소, 출입 방식, 주차, 예약 가능 시간을 먼저 확인합니다." },
    { q: "불법·선정적 서비스도 가능한가요?", a: "불법·선정적 서비스는 제공하거나 안내하지 않습니다." },
  ];

  const h1 = `${zone.name} · 생활권과 숙소 이용 기준 안내`;
  const body = `
<section class="section"><div class="wrap">
  <span class="eyebrow">${esc(city.name)} · ${esc(area.name)}</span>
  <h1>${esc(h1)}</h1>
  <div class="prose">
    <p>${esc(zone.name)}은 ${esc(city.name)}에 속한 생활권으로, ${esc(zone.character)}입니다. ${esc(zone.note)}</p>

    <h2>대표 지점</h2>
    <p>${esc(zone.name)} 주변으로는 <strong>${lm.map(esc).join(", ")}</strong> 등이 대표 지점으로 꼽힙니다. 같은 생활권 안에서도 상권 중심과 외곽, 관광 지점 인근은 이동 동선과 주차 환경이 달라, 방문 주소가 어느 지점과 가까운지를 먼저 확인하는 것이 예약을 정확하게 진행하는 방법입니다.</p>

    <h2>위치와 접근</h2>
    <p>${esc(zone.name)}은 상위 권역인 <a href="/area/${area.slug}/">${esc(area.name)}</a>에 속하며, <a href="/${city.slug}/">${esc(city.name)}</a> 안내와 함께 보면 이동 기준을 잡기 쉽습니다. ${stationLine}</p>

    <h2>숙소 유형별 이용 기준</h2>
    <p>${esc(zone.name)}에서 자주 이용되는 숙소 유형과 확인 항목은 아래와 같습니다.</p>
    <ul>${stayText}</ul>

    <h2>이동·예약 전 확인</h2>
    <p>${esc(zone.name)}은 시간대와 계절에 따라 진입·주차 여건이 달라질 수 있어, 방문 주소와 건물 형태, 공동현관·객실 출입 방식, 주차 가능 여부, 예약 가능 시간을 먼저 확인합니다. 겨울철 이동이 필요한 지역이면 <a href="/check/winter-road/">겨울철 도로·날씨 확인</a> 기준을 함께 봅니다. 확인이 끝나면 <a href="tel:0508-202-4719">전화예약 0508-202-4719</a>로 방문 가능 여부를 안내받을 수 있습니다. ${esc(SITE_LINE)}</p>
  </div>
</div></section>`;

  return { body, faqs, related, context: zone.name };
}
