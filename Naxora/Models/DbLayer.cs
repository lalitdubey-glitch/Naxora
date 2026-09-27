using Microsoft.Data.SqlClient;
using System.Data;

namespace Naxora.Models
{
    public class DbLayer : IDbLayer
    {
        private readonly string _Conn;
        public DbLayer(IConfiguration config)
        {
            _Conn = config.GetConnectionString("ConStr")!;
        }

        public async Task<int> ExecuteQuery(string procname, SqlParameter[] parameters)
        {
            using SqlConnection conn = new SqlConnection(_Conn);
            using SqlCommand cmd = new SqlCommand(procname, conn);
            cmd.CommandType = CommandType.StoredProcedure;
            if (parameters != null)
            {
                cmd.Parameters.AddRange(parameters);
            }
            await conn.OpenAsync();
            int res = await cmd.ExecuteNonQueryAsync();
            return res;
        }

        public async Task<DataTable> Table(string procname, SqlParameter[] parameters)
        {
            using SqlConnection conn = new SqlConnection(_Conn);
            using SqlCommand cmd = new SqlCommand(procname, conn);
            cmd.CommandType = CommandType.StoredProcedure;
            if (parameters != null)
            {
                cmd.Parameters.AddRange(parameters);
            }
            await conn.OpenAsync();
            DataTable dt = new DataTable();
            SqlDataReader reader = await cmd.ExecuteReaderAsync();
            dt.Load(reader);
            return dt;
        }
    }
}
