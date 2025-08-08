using System.Diagnostics;
using TestDb;

namespace Tests;

[DebuggerStepThrough]
[ShouldlyMethods]
public static class ShouldlyExtensions
{
    public static void ShouldMatchApproved(this TestDbContext hiveDataContext)
    {
        hiveDataContext.DbTrace.ShouldMatchApproved(opts => opts.NoDiff().WithFileExtension(".db.txt"));
    }
}
