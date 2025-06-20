import { Recipe } from "@/types";

// Lightweight recipe metadata for listing page
export interface RecipeMeta {
  id: string;
  name: {
    en: string;
    th: string;
  };
  description: {
    en: string;
    th: string;
  };
  servings: number;
  time: number;
  image: string;
  category: string[];
}

// Optimized metadata for fast loading on recipes page
export const recipesMeta: RecipeMeta[] = [
  {
    id: "red-curry-chicken",
    name: {
      en: "Red Curry Chicken",
      th: "แกงเผ็ดไก่"
    },
    description: {
      en: "A classic Thai red curry with tender chicken pieces in a rich, aromatic coconut sauce.",
      th: "แกงเผ็ดไก่สูตรดั้งเดิม เนื้อไก่นุ่มในซอสกะทิหอมกรุ่น"
    },
    servings: 4,
    time: 30,
    image: "https://i.postimg.cc/g0XpP20f/Untitled-1.png",
    category: ["curry", "chicken"]
  },
  {
    id: "classic-pad-thai",
    name: {
      en: "Classic Pad Thai",
      th: "ผัดไทยสูตรต้นตำรับ"
    },
    description: {
      en: "Thailand's famous stir-fried noodle dish with the perfect balance of sweet, sour, and savory flavors.",
      th: "อาหารผัดเส้นชื่อดังของไทย รสชาติสมดุลทั้งหวาน เปรี้ยว และเค็ม"
    },
    servings: 2,
    time: 25,
    image: "https://i.postimg.cc/QtKc51d0/pad-thai.png",
    category: ["noodles", "vegetarian-option"]
  },
  {
    id: "panang-curry-beef",
    name: {
      en: "Panang Curry with Beef",
      th: "แกงแพนงเนื้อ"
    },
    description: {
      en: "Rich and creamy Panang curry with tender beef slices, infused with aromatic spices and a hint of peanut flavor.",
      th: "แกงแพนงเนื้อนุ่มที่มีรสชาติเข้มข้นและครีมมี่ หอมกลิ่นเครื่องเทศและกลิ่นถั่ว"
    },
    servings: 4,
    time: 35,
    image: "https://i.postimg.cc/CLqbdjQ1/Panang-curry.png",
    category: ["curry", "beef"]
  },
  {
    id: "green-curry-vegetables",
    name: {
      en: "Vegetable Green Curry",
      th: "แกงเขียวหวานผัก"
    },
    description: {
      en: "A vibrant Thai green curry loaded with fresh vegetables and aromatic herbs in a smooth coconut sauce.",
      th: "แกงเขียวหวานผักสดหลากหลายชนิดและสมุนไพรหอมในน้ำแกงกะทิเนียนนุ่ม"
    },
    servings: 4,
    time: 25,
    image: "https://i.postimg.cc/SxY1S2W7/Green-curry.png",
    category: ["curry", "vegetarian"]
  },
  {
    id: "tom-yum-goong",
    name: {
      en: "Tom Yum Goong",
      th: "ต้มยำกุ้ง"
    },
    description: {
      en: "Classic Thai hot and sour soup with succulent prawns, aromatic herbs and a spicy kick.",
      th: "ต้มยำกุ้งแบบดั้งเดิม รสเผ็ดเปรี้ยว ใส่กุ้งสดและสมุนไพรหอม"
    },
    servings: 4,
    time: 20,
    image: "https://i.postimg.cc/0jc5yH13/tom-yum.png",
    category: ["soup", "seafood"]
  },
  {
    id: "massaman-curry-chicken",
    name: {
      en: "Massaman Chicken Curry",
      th: "แกงมัสมั่นไก่"
    },
    description: {
      en: "A rich, mild Thai curry with Persian influences featuring tender chicken, potatoes and a complex blend of spices.",
      th: "แกงมัสมั่นไก่รสชาติเข้มข้น ได้รับอิทธิพลจากเปอร์เซีย มีเนื้อไก่นุ่ม มันฝรั่ง และเครื่องเทศหลากหลายชนิด"
    },
    servings: 6,
    time: 50,
    image: "https://i.postimg.cc/GhHqK8Sw/Massaman-curry.png",
    category: ["curry", "chicken"]
  },
  {
    id: "thai-sukiyaki",
    name: {
      en: "Thai Sukiyaki (Suki)",
      th: "สุกี้ยากี้"
    },
    description: {
      en: "A Thai-style hot pot dish with glass noodles, vegetables, and your choice of meat, served with a flavorful sukiyaki sauce.",
      th: "อาหารประเภทหม้อไฟสไตล์ไทย ใส่วุ้นเส้น ผัก และเนื้อสัตว์ตามชอบ เสิร์ฟพร้อมน้ำจิ้มสุกี้รสชาติเข้มข้น"
    },
    servings: 4,
    time: 30,
    image: "https://i.postimg.cc/2j2CvJg9/moo-kra-ta.png",
    category: ["hot pot", "versatile"]
  }
];

// Recipe loader utility for lazy loading full recipe data
export async function loadRecipeDetail(id: string): Promise<Recipe | null> {
  try {
    const recipes = await import("./recipes");
    return recipes.recipes.find((recipe: Recipe) => recipe.id === id) || null;
  } catch (error) {
    console.error(`Failed to load recipe: ${id}`, error);
    return null;
  }
}

// Export metadata as default for recipes listing
export { recipesMeta as recipes };
