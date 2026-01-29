export const formatRole = (role) => {
  if (!role) return "";
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

export const formatPathName = (path) => {
  if (!path) return ""

  return path
    .replace("/", "")               // remove /
    .replace(/-/g, " ")             // replace - with space
    .replace(/\b\w/g, (c) => c.toUpperCase()) // capitalize first letters
}

export const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString)

  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()

  return `${day}-${month}-${year}`
}
