// =============================================================================
// 간다GO · 사이트 전역 설정
// -----------------------------------------------------------------------------
// ⚠️ 배포 전 확인: DOMAIN, TELEGRAM_* 값을 실제 값으로 교체하세요.
// =============================================================================

export const SITE = {
  name: "간다GO",
  nameEn: "gandaGO",
  // 강원도 출장마사지·홈타이 지역 안내 (방문형 웰니스 안내)
  tagline: "강원도 관광 숙소·생활권별 방문 가능 지역 안내",
  phone: "0508-202-4719",
  phoneHref: "tel:0508-202-4719",

  // 실제 운영 도메인
  domain: "https://sootheme.pages.dev",

  // 텔레그램 문의 링크 (실제 핸들로 교체하세요)
  telegramWeb: "https://t.me/gandago_web",       // 웹사이트 제작문의
  telegramPartner: "https://t.me/gandago_ad",    // 제휴문의

  locale: "ko_KR",
  region: "강원특별자치도",
};

// 히어로 배경 & 대표 OG 이미지 (모든 지역 페이지 히어로 + og:image + schema image)
// ⚠️ 이 경로에 이미지를 업로드하면 전 지역 히어로에 한 번에 노출됩니다.
export const HERO_IMAGE = "/assets/img/hero.jpg";
export const DEFAULT_OG = "/assets/img/hero.jpg";
