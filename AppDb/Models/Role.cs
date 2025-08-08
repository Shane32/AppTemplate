namespace AppDb.Models;

[Flags]
public enum Role : long
{
    Operator = 1 << 0,
    Admin = 1 << 1,
    SysAdmin = 1 << 2,
}
