const personaImageMap: Record<string, string> = {
  猛攻将: "/images/personas/menggonglang.webp",
  老板: "/images/personas/laoban.webp",
  鼠鼠: "/images/personas/shushu.webp",
  本质高手: "/images/personas/benzhigaoshou.webp",
  妈妈: "/images/personas/mama.webp",
  秃鹫: "/images/personas/tujiu.webp",
  收藏家: "/images/personas/shoucangjia.webp",
  威龙: "/images/personas/weilong.webp",
  教官: "/images/personas/jiaoguan.webp",
  赛伊德: "/images/personas/saiyide.webp",
  德穆兰: "/images/personas/demulan.webp",
  渡鸦: "/images/personas/duya.webp",
  哈德森: "/images/personas/hadesen.webp",
  雷斯: "/images/personas/leisi.webp",
  嘉豪: "/images/personas/jiahao.webp",
  老贝榨: "/images/personas/laobeizha.webp",
  堵桥来: "/images/personas/duqiaolai.webp",
  唐王大人: "/images/personas/tangwang.webp",
  西普坝王: "/images/personas/xipubawang.webp",
  林树: "/images/personas/linshu.webp",
  昊天: "/images/personas/haotian.webp",
  夺舍的狼: "/images/personas/duoshedelang.webp",
};

const personaImagePositionMap: Record<string, string> = {
  // 默认先略上移，优先保证头部出现，再逐步按角色微调
  default: "50% 18%",
  堵桥来: "50% 20%",
  老贝榨: "50% 19%",
  林树: "50% 16%",
  昊天: "50% 16%",
};

export function getPersonaImageUrl(nameCn: string) {
  return personaImageMap[nameCn] ?? "/images/personas/menggonglang.webp";
}

export function getPersonaImagePosition(nameCn: string) {
  return personaImagePositionMap[nameCn] ?? personaImagePositionMap.default;
}
