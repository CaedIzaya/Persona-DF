const personaImageMap: Record<string, string> = {
  猛攻将: "/images/personas/menggonglang.png",
  老板: "/images/personas/laoban.png",
  鼠鼠: "/images/personas/shushu.png",
  本质高手: "/images/personas/benzhigaoshou.png",
  妈妈: "/images/personas/mama.png",
  秃鹫: "/images/personas/tujiu.png",
  收藏家: "/images/personas/shoucangjia.png",
  威龙: "/images/personas/weilong.png",
  教官: "/images/personas/jiaoguan.png",
  赛伊德: "/images/personas/saiyide.png",
  德穆兰: "/images/personas/demulan.png",
  渡鸦: "/images/personas/duya.png",
  哈德森: "/images/personas/hadesen.png",
  雷斯: "/images/personas/leisi.png",
  嘉豪: "/images/personas/jiahao.png",
  老贝榨: "/images/personas/laobeizha.png",
  堵桥来: "/images/personas/duqiaolai.png",
  唐王大人: "/images/personas/tangwang.png",
  西普坝王: "/images/personas/xipubawang.png",
  林树: "/images/personas/linshu.png",
  昊天: "/images/personas/haotian.png",
  夺舍的狼: "/images/personas/duoshedelang.png",
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
  return personaImageMap[nameCn] ?? "/images/personas/menggonglang.png";
}

export function getPersonaImagePosition(nameCn: string) {
  return personaImagePositionMap[nameCn] ?? personaImagePositionMap.default;
}
