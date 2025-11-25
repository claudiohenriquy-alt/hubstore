// /api/products.ts

export type Product = {
  id: string;
  externalId: string;
  title: string;
  price_cents: number;
  file: string;
};

export const PRODUCTS: Record<string, Product> = {
  "product-001": {
    id: "product-001",
    externalId: "prod_robo_ai",
    title: "Robô AI-Assist",
    price_cents: 1990,
    file: "https://drive.google.com/drive/folders/1GyCxNqQcufTzNnnNXrQnZ48peo4ReNYp?usp=drive_link"
  },
  "product-002": {
    id: "product-002",
    externalId: "prod_fornecedores_premium",
    title: "Lista de Fornecedores Premium",
    price_cents: 1490,
    file: "https://drive.google.com/file/d/1ttquBeNbiulk_b7qGcvh-xlIziM2Et61/view?usp=drive_link"
  },
  "product-003": {
    id: "product-003",
    externalId: "prod_catalogo_exclusivos",
    title: "Catálogo de Produtos Exclusivos",
    price_cents: 1290,
    file: "https://drive.google.com/file/d/1Q7sSpORi9t0bNlQD6gIBgaW9swMQNXz5/view?usp=drive_link"
  },
  "product-004": {
    id: "product-004",
    externalId: "prod_sms_massa",
    title: "Pacote Completo – Envio de SMS em Massa",
    price_cents: 1690,
    file: "https://drive.google.com/drive/folders/1NCCGrQc_vuALu2vwRcMsOGykIzpWefcV?usp=drive_link"
  },
  "product-005": {
    id: "product-005",
    externalId: "prod_jarvee_automacao",
    title: "Jarvee – Automação Completa",
    price_cents: 2490,
    file: "https://drive.google.com/drive/folders/1ASj94tBCNd3OJ-4k1A4b2wNfbjg6YyIK?usp=drive_link"
  },
  "product-006": {
    id: "product-006",
    externalId: "prod_tubeviews",
    title: "TubeViews – YouTube Booster",
    price_cents: 990,
    file: "https://drive.google.com/drive/folders/17yplvC8leZncMnWs2w49AioaRoqrM_Hs?usp=drive_link"
  },
  "product-007": {
    id: "product-007",
    externalId: "prod_socinator",
    title: "Socinator – Automação Profissional",
    price_cents: 2290,
    file: "https://drive.google.com/drive/folders/1bt4ONHmg6ah_QvWKXAjkjQT0esS6G9jw?usp=drive_link"
  },
  "product-008": {
    id: "product-008",
    externalId: "prod_jarvee_pc",
    title: "Jarvee – Gerenciador de Redes (PC)",
    price_cents: 1990,
    file: "https://drive.google.com/drive/folders/1zziJUtoTyG7jaYAHRU6XeRdVtvYDdMX2?usp=drive_link"
  },
  "product-009": {
    id: "product-009",
    externalId: "prod_instabot",
    title: "Instabot Pro – Automação Instagram",
    price_cents: 1290,
    file: "https://drive.google.com/drive/folders/1uMAgTrE0LIHTiq0xK_Lc1Ua0VXIfZ94K?usp=drive_link"
  },
  "product-010": {
    id: "product-010",
    externalId: "prod_insta_extractor",
    title: "Insta Extractor + Licença",
    price_cents: 1490,
    file: "https://drive.google.com/drive/folders/193VTdlaZseLVOZ5H0zCJa3Sdah6kpdlH?usp=drive_link"
  }
};

export const PRODUCTS_BY_EXTERNAL = Object.values(PRODUCTS).reduce((acc, p) => {
  acc[p.externalId] = p;
  return acc;
}, {} as Record<string, Product>);