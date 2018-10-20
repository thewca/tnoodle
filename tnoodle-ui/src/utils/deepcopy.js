export default function deepcopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}
