export const getRoleRedirect = (role) => {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "supplier":
      return "/supplier/dashboard";
    case "buyer":
      return "/buyer/dashboard";
    default:
      return "/";
  }
};
