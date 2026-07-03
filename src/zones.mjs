// =============================================================================
// 간다GO · 핵심 생활권(life zone) DB
// -----------------------------------------------------------------------------
// 각 생활권은 실제 지리 속성(대표 지점·성격·접근·숙소 유형·고유 메모)을 가진다.
// 렌더러가 이 고유 속성을 본문 전면에 배치해 페이지마다 내용이 실제로 달라진다.
// index: true  → 검색 수요·설명량이 충분해 단독 색인
// index: false → 얇은 외곽 생활권 → 상위 시·군으로 canonical 통합(도어웨이 방지)
// =============================================================================

export const LIFE_ZONES = [
  // ── 춘천·홍천권 ──
  {
    slug: "chuncheon-myeongdong-jungangro", name: "춘천 명동·중앙로", city: "chuncheon-si",
    character: "춘천에서 유동 인구가 가장 많은 대표 상권·번화가",
    landmarks: ["명동 닭갈비골목", "중앙로 지하상가", "브라운5번가", "춘천 명동 상점가"],
    stay: ["hotel", "officetel"], station: "남춘천역", index: true,
    note: "명동·중앙로는 저녁 시간대 도보 통행과 주차가 크게 몰리는 구역이라, 인근 호텔·비즈니스 숙소는 주차 진입 방식과 체크인 동선을 미리 확인하는 편이 좋습니다.",
  },
  {
    slug: "chuncheon-onui-toegye", name: "춘천 온의·퇴계", city: "chuncheon-si",
    character: "신축 아파트와 오피스텔이 늘어난 주거·상업 혼합 지구",
    landmarks: ["온의동 롯데캐슬 일대", "퇴계동 먹자골목", "춘천 종합운동장 인근"],
    stay: ["apartment-home", "officetel"], station: "남춘천역", index: true,
    note: "온의·퇴계는 고층 아파트와 오피스텔이 많아 공동현관 비밀번호, 동·호수, 지하주차장 진입 방식이 건물마다 다릅니다. 예약 전 출입 방법을 함께 확인해야 이동 시간이 정확해집니다.",
  },
  {
    slug: "chuncheon-seoksa-hupyeong", name: "춘천 석사·후평", city: "chuncheon-si",
    character: "강원대 인접 대학가와 후평 주거·공단 배후 생활권",
    landmarks: ["강원대학교 인근", "석사동 원룸·오피스텔가", "후평동 주거단지"],
    stay: ["officetel", "apartment-home"], station: "남춘천역", index: true,
    note: "석사동은 강원대 인접 원룸·오피스텔이 밀집해 야간 공동현관 출입 방식 확인이 중요하고, 후평동은 오래된 주거단지와 공단이 섞여 있어 동·호수 확인이 필요합니다.",
  },
  {
    slug: "hongcheon-vivaldi-park", name: "홍천 비발디파크 인접권", city: "hongcheon-gun",
    character: "서울 접근성이 좋은 대형 리조트와 오션월드 워터파크 배후권",
    landmarks: ["비발디파크", "오션월드", "홍천 서면 일대"],
    stay: ["resort", "pension"], station: null, index: true,
    note: "비발디파크는 스키·워터파크 성수기에 단지 진입과 주차가 크게 몰립니다. 리조트 동·층 위치와 서면 방향 진입로, 야간 이동 가능 시간을 함께 확인하는 편이 안전합니다.",
  },

  // ── 원주·횡성권 ──
  {
    slug: "wonju-musil-dangye", name: "원주 무실·단계", city: "wonju-si",
    character: "원주 신도심 상업지구와 법조타운이 있는 중심 생활권",
    landmarks: ["무실동 법조타운", "단계동 상권", "원주 신도심 오피스텔가"],
    stay: ["hotel", "officetel"], station: "원주역", index: true,
    note: "무실·단계는 원주 신도심의 상업·업무 중심으로 호텔과 오피스텔이 밀집해 있습니다. 낮과 저녁의 유동 흐름이 달라 주차 진입 여건을 예약 시간대와 함께 확인합니다.",
  },
  {
    slug: "wonju-bangok-innovation", name: "원주 반곡·혁신도시", city: "wonju-si",
    character: "공공기관이 이전한 혁신도시와 신축 아파트 중심 생활권",
    landmarks: ["원주 혁신도시", "반곡동 공공기관 단지", "국민건강보험공단 인근"],
    stay: ["hotel", "apartment-home"], station: "원주역", index: true,
    note: "반곡동 혁신도시는 공공기관 종사자 출장 수요가 있는 신도시입니다. 신축 아파트·오피스텔이 많아 공동현관과 방문 주차 등록 방식을 예약 전에 확인하는 것이 좋습니다.",
  },
  {
    slug: "wonju-enterprise-city", name: "원주 기업도시", city: "wonju-si",
    character: "지정면 일대에 조성된 기업도시 신주거권",
    landmarks: ["원주 기업도시", "지정면 신축 아파트단지"],
    stay: ["apartment-home"], station: "만종역", index: false, // 시내와 거리 있어 상위 canonical
    note: "원주 기업도시는 지정면 일대 신도시로 시내 중심과 거리가 있어 이동 시간을 넉넉히 확인해야 합니다. 세부 설명이 제한적이라 상위 시·군 안내로 통합해 관리합니다.",
  },
  {
    slug: "hoengseong-dunnae-wellihilli", name: "횡성 둔내·웰리힐리", city: "hoengseong-gun",
    character: "둔내 고원의 웰리힐리파크 리조트 배후 생활권",
    landmarks: ["웰리힐리파크", "둔내면 소재지", "둔내 고랭지 일대"],
    stay: ["resort", "pension"], station: "둔내역", index: true,
    note: "웰리힐리파크는 둔내 고원에 자리해 겨울철 진입 도로 상황이 이동 시간을 좌우합니다. 둔내역·서원주 방면 접근과 리조트 단지 내 동선을 함께 확인합니다.",
  },

  // ── 강릉·동해·삼척권 ──
  {
    slug: "gangneung-gyodong-yucheon", name: "강릉 교동·유천", city: "gangneung-si",
    character: "강릉 최대 상권 교동택지와 신도시 유천택지",
    landmarks: ["교동택지지구", "유천택지지구", "강릉 시청 인근"],
    stay: ["hotel", "officetel"], station: "강릉역", index: true,
    note: "교동은 강릉 대표 상권과 택지지구가 겹쳐 유동 인구가 많고, 유천은 신축 아파트가 많은 신도시입니다. 상권 밀집 구역은 저녁 주차 여건을 예약 시간과 함께 확인합니다.",
  },
  {
    slug: "gangneung-gyeongpo-anmok", name: "강릉 경포·안목", city: "gangneung-si",
    character: "경포해변과 안목 커피거리를 낀 대표 관광 해안권",
    landmarks: ["경포해변", "안목 커피거리", "경포호 일대"],
    stay: ["beach-accommodation", "hotel"], station: "강릉역", index: true,
    note: "경포·안목은 여름 성수기와 주말에 해안도로 정체와 주차난이 뚜렷합니다. 해변 인접 호텔·펜션은 진입로와 객실 위치를 확인하고 예약 시간대에 여유를 두는 편이 안전합니다.",
  },
  {
    slug: "gangneung-jumunjin", name: "강릉 주문진", city: "gangneung-si",
    character: "주문진항과 수산시장, 드라마 촬영지로 알려진 북부 관광권",
    landmarks: ["주문진항", "주문진 수산시장", "소돌 아들바위공원"],
    stay: ["pension", "beach-accommodation"], station: null, index: true,
    note: "주문진은 강릉 시내에서 북쪽으로 떨어진 항구·관광지로, 이동 시간을 시내 기준과 다르게 잡아야 합니다. 관광철에는 시장·항구 주변 주차가 몰립니다.",
  },
  {
    slug: "donghae-cheongok-mukho", name: "동해 천곡·묵호", city: "donghae-si",
    character: "동해 도심 천곡과 논골담길로 알려진 묵호항권",
    landmarks: ["천곡동 도심", "묵호항", "논골담길", "묵호등대"],
    stay: ["hotel", "beach-accommodation"], station: "묵호역", index: true,
    note: "천곡은 동해 도심 상권, 묵호는 항구·논골담길 관광지로 성격이 다릅니다. 묵호항 언덕길 숙소는 진입로가 좁은 곳이 있어 차량 진입 가능 여부를 확인합니다.",
  },
  {
    slug: "samcheok-beach-solbeach", name: "삼척해변·쏠비치 인접권", city: "samcheok-si",
    character: "삼척해변과 산토리니 콘셉트의 쏠비치 리조트 인접 해안권",
    landmarks: ["삼척해변", "쏠비치 삼척", "삼척항 인근"],
    stay: ["resort", "beach-accommodation"], station: null, index: true,
    note: "쏠비치 삼척은 대규모 해안 리조트라 단지 내 동·층 이동 동선이 넓습니다. 삼척해변 인접 숙소는 성수기 진입 도로와 주차 상황을 확인하는 편이 좋습니다.",
  },

  // ── 속초·양양·고성권 ──
  {
    slug: "sokcho-joyang-gyodong", name: "속초 조양·교동", city: "sokcho-si",
    character: "속초 도심 주거·상업이 모인 시내 중심 생활권",
    landmarks: ["조양동 주거단지", "교동 상권", "속초 시외버스터미널 인근"],
    stay: ["hotel", "officetel"], station: null, index: true,
    note: "조양·교동은 속초 도심으로 시내 접근이 좋은 대신, 관광 성수기에는 시내 도로 정체가 이동 시간을 늘립니다. 오피스텔은 공동현관 출입 방식을 확인합니다.",
  },
  {
    slug: "sokcho-daepo-seorak", name: "속초 대포항·설악동", city: "sokcho-si",
    character: "대포항과 설악산 입구 설악동을 낀 관광 숙박 밀집권",
    landmarks: ["대포항", "설악동 소공원", "설악산 입구", "속초해변"],
    stay: ["beach-accommodation", "hotel"], station: null, index: true,
    note: "대포항은 관광 항구, 설악동은 설악산 입구 숙박 단지로 주말·성수기 진입 정체가 큽니다. 해변·항구 인접 숙소는 진입로와 주차 여건을 예약 전에 확인합니다.",
  },
  {
    slug: "yangyang-naksan-ingu", name: "양양 낙산·인구", city: "yangyang-gun",
    character: "낙산해변·낙산사와 서핑 성지 인구·죽도 해변권",
    landmarks: ["낙산해변", "낙산사", "인구해변", "죽도해변 서핑 스팟"],
    stay: ["beach-accommodation", "pension"], station: null, index: true,
    note: "낙산은 낙산사·해변 관광, 인구·죽도는 서핑 수요가 큰 해변입니다. 서핑 시즌에는 해변 주변 펜션·게스트하우스 주차가 몰려 진입 동선을 확인하는 편이 좋습니다.",
  },
  {
    slug: "goseong-toseong-ganseong", name: "고성 토성·간성", city: "goseong-gun",
    character: "속초 인접 해안 펜션권 토성면과 고성 군청 소재 간성읍",
    landmarks: ["아야진항", "토성면 해안", "간성읍 소재지", "청간정"],
    stay: ["pension", "border-area"], station: null, index: true,
    note: "토성면은 속초와 이어지는 해안 펜션권이라 아야진 방향 진입을 확인하고, 간성읍은 고성 북부 중심으로 이동 거리를 넉넉히 잡아야 합니다.",
  },

  // ── 평창·정선·태백권 ──
  {
    slug: "pyeongchang-daegwallyeong-yongpyong", name: "평창 대관령·용평", city: "pyeongchang-gun",
    character: "대관령 고지대의 용평리조트·발왕산 스키 관광권",
    landmarks: ["용평리조트", "발왕산", "대관령면 소재지", "알펜시아 인근"],
    stay: ["ski-resort", "resort"], station: "진부역", index: true,
    note: "용평리조트는 대관령 고지대에 있어 겨울철 진입 도로 상황이 이동 시간을 크게 바꿉니다. 진부역 KTX 접근과 단지 내 동·층 위치, 심야 이동 가능 여부를 함께 확인합니다.",
  },
  {
    slug: "pyeongchang-bongpyeong-phoenix", name: "평창 봉평·휘닉스파크", city: "pyeongchang-gun",
    character: "메밀꽃으로 알려진 봉평과 휘닉스파크 스키·워터파크권",
    landmarks: ["휘닉스 평창", "블루캐니언 워터파크", "봉평 메밀꽃마을", "이효석문학관"],
    stay: ["ski-resort", "resort"], station: "진부역", index: true,
    note: "휘닉스파크는 봉평에 자리한 스키·워터파크 복합 리조트로 사계절 수요가 있습니다. 봉평 방향 진입로와 단지 주차, 시즌 성수기 진입 정체를 확인합니다.",
  },
  {
    slug: "jeongseon-gohan-sabuk", name: "정선 고한·사북", city: "jeongseon-gun",
    character: "강원랜드와 하이원을 낀 고한·사북 고지대 생활권",
    landmarks: ["고한읍 소재지", "사북읍 소재지", "강원랜드 인근", "하이원 진입로"],
    stay: ["resort", "hotel"], station: null, index: true,
    note: "고한·사북은 강원랜드·하이원 배후 생활권으로 고지대에 있어 야간·겨울 이동 관리가 중요합니다. 숙소 위치가 읍내인지 리조트 방향인지에 따라 진입로가 다릅니다.",
  },
  {
    slug: "jeongseon-high1-resort", name: "정선 하이원 인접권", city: "jeongseon-gun",
    character: "고한 고지대의 하이원리조트·마운틴탑 대형 스키 리조트권",
    landmarks: ["하이원리조트", "하이원 마운틴탑", "하이원 스키장"],
    stay: ["ski-resort", "resort"], station: null, index: true,
    note: "하이원리조트는 고지대 대형 스키 단지로 단지 내 동선이 길고 겨울 성수기 진입·주차에 시간이 걸립니다. 콘도 동·층 위치와 셔틀 동선을 확인하는 편이 좋습니다.",
  },
  {
    slug: "taebaek-hwangji-station", name: "태백 황지·태백역", city: "taebaek-si",
    character: "황지연못을 낀 태백 도심과 태백역 인접권",
    landmarks: ["황지연못", "태백역", "태백 시내 상권"],
    stay: ["hotel", "pension"], station: "태백역", index: true,
    note: "황지는 태백 도심(황지연못 일대)으로 태백역과 가깝습니다. 산악 도시 특성상 겨울철 이동 시간이 달라질 수 있어 도로 상황을 함께 확인합니다.",
  },

  // ── 접경·외곽권 (대부분 상위 시·군으로 canonical 통합) ──
  {
    slug: "cheorwon-dongsong-galmal", name: "철원 동송·갈말", city: "cheorwon-gun",
    character: "철원 최대 생활권 동송읍과 고석정·한탄강 관광의 갈말읍",
    landmarks: ["동송읍 소재지", "갈말읍", "고석정", "한탄강"],
    stay: ["outer-area", "border-area"], station: null, index: false,
    note: "동송은 철원 최대 읍이고 갈말은 고석정·한탄강 관광지가 있습니다. 접경·외곽 특성상 정확한 주소와 진입 가능 여부를 먼저 확인하며, 상위 시·군 안내로 통합해 관리합니다.",
  },
  {
    slug: "hwacheon-sanae", name: "화천읍·사내", city: "hwacheon-gun",
    character: "산천어축제로 알려진 화천읍과 사창리 군부대 접경 사내면",
    landmarks: ["화천읍 소재지", "화천 산천어축제장", "사내면 사창리"],
    stay: ["outer-area", "border-area"], station: null, index: false,
    note: "화천읍은 산천어축제 시기 유동 인구가 몰리고, 사내면 사창리는 군부대 접경권입니다. 세부 읍면을 촘촘히 나누기보다 상위 시·군 기준으로 이동 가능 여부를 안내합니다.",
  },
  {
    slug: "yanggu-center", name: "양구읍·국토정중앙", city: "yanggu-gun",
    character: "양구 군청 소재 양구읍과 국토정중앙 관광권",
    landmarks: ["양구읍 소재지", "국토정중앙천문대", "양구 백자박물관 인근"],
    stay: ["outer-area", "border-area"], station: null, index: false,
    note: "양구읍은 군청 소재지이고 국토정중앙 관광 시설이 있습니다. 접경 외곽 특성상 이동 거리와 진입 가능 여부를 확인하며, 상위 시·군 안내로 통합합니다.",
  },
  {
    slug: "inje-wontong", name: "인제읍·원통", city: "inje-gun",
    character: "인제읍과 백담사·설악 입구·군부대 접경의 원통(북면)",
    landmarks: ["인제읍 소재지", "원통 시가지", "백담사 입구", "북면 군부대 접경"],
    stay: ["outer-area", "border-area"], station: null, index: false,
    note: "원통은 인제 북부의 군부대 접경이자 백담사·설악 입구입니다. 산간·접경 이동 특성상 야간 이동 제한 구간이 있어 상위 시·군 기준으로 안내합니다.",
  },
  {
    slug: "yeongwol-donggang", name: "영월읍·동강 숙소권", city: "yeongwol-gun",
    character: "단종 유적의 영월읍과 래프팅·펜션의 동강 관광 숙소권",
    landmarks: ["영월읍 소재지", "장릉", "청령포", "동강 래프팅 구간"],
    stay: ["pension", "outer-area"], station: null, index: true,
    note: "영월읍은 장릉·청령포 등 단종 유적 도심이고, 동강은 래프팅·캠핑 펜션이 흩어진 관광권입니다. 동강 방향 독채 숙소는 진입로가 좁고 야간 이동이 제한되는 곳이 있어 확인이 필요합니다.",
  },
];
