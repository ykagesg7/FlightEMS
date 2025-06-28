// CPL航空法記事のテストデータ（learning_contentsテーブル形式に統一）
export const cplAviationLawContents = [
  {
    id: '3.0_AviationLegal0',
    title: 'CPL航空法 Mission 0: 完全攻略ブリーフィング',
    category: 'CPL航空法',
    description: 'CPL試験の航空法規分野を攻略するための基礎知識',
    order_index: 0,
    parent_id: null,
    content_type: 'article',
    is_published: true,
    is_freemium: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3.1_AviationLegal1',
    title: 'CPL航空法 Mission 1-1: 技能証明制度の完全理解',
    category: 'CPL航空法',
    description: '技能証明制度の詳細を理解し、CPL試験で頻出される技能証明関連問題を完全攻略',
    order_index: 1,
    parent_id: null,
    content_type: 'article',
    is_published: true,
    is_freemium: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3.2_AviationLegal2',
    title: 'CPL航空法 Mission 1-2: 航空身体検査証明の要件',
    category: 'CPL航空法',
    description: '航空身体検査証明制度の詳細を完全理解し、CPL試験での身体検査関連問題を確実に得点',
    order_index: 2,
    parent_id: null,
    content_type: 'article',
    is_published: true,
    is_freemium: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3.3_AviationLegal3',
    title: 'CPL航空法 Mission 2-1: 航空機の耐空性と安全基準',
    category: 'CPL航空法',
    description: '航空機の耐空性、安全基準、検査制度について詳しく学習',
    order_index: 3,
    parent_id: null,
    content_type: 'article',
    is_published: true,
    is_freemium: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3.4_AviationLegal4',
    title: 'CPL航空法 Mission 2-2: 航空交通管制と飛行規則',
    category: 'CPL航空法',
    description: '航空交通管制システムと各種飛行規則の詳細解説',
    order_index: 4,
    parent_id: null,
    content_type: 'article',
    is_published: true,
    is_freemium: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3.5_AviationLegal5',
    title: 'CPL航空法 Mission 3: 航空事故調査と責任体系',
    category: 'CPL航空法',
    description: '航空事故・重大インシデントの調査体系と法的責任について',
    order_index: 5,
    parent_id: null,
    content_type: 'article',
    is_published: true,
    is_freemium: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// テスト環境用の学習-テストマッピングデータ
export const testLearningTestMappings = [
  {
    content_id: '3.0_AviationLegal0',
    content_title: 'CPL航空法 Mission 0: 完全攻略ブリーフィング',
    test_id: 'cpl_aviation_law_basic',
    test_category: 'CPL航空法',
    subject_area: '航空法基礎',
    relationship_type: 'prerequisite',
    weight_score: 0.9
  },
  {
    content_id: '3.1_AviationLegal1',
    content_title: 'CPL航空法 Mission 1-1: 技能証明制度の完全理解',
    test_id: 'cpl_skill_certification',
    test_category: 'CPL航空法',
    subject_area: '技能証明',
    relationship_type: 'direct',
    weight_score: 1.0
  },
  {
    content_id: '3.2_AviationLegal2',
    content_title: 'CPL航空法 Mission 1-2: 航空身体検査証明の要件',
    test_id: 'cpl_medical_certification',
    test_category: 'CPL航空法',
    subject_area: '身体検査証明',
    relationship_type: 'direct',
    weight_score: 1.0
  }
]; 