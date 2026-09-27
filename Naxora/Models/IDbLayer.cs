using Microsoft.Data.SqlClient;
using System.Data;

namespace Naxora.Models
{
    public interface IDbLayer
    {
        Task<int> ExecuteQuery(string procname, SqlParameter[] parameters);
        Task<DataTable> Table(string procname, SqlParameter[] parameters);
    }
}