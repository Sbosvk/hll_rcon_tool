import {
  get,
  handle_http_errors,
  showResponse,
} from "@/utils/fetchUtils";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { Button } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { List as IList, fromJS } from "immutable";
import Grid from "@mui/material/Grid2";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import dayjs from "dayjs";
import {useEffect, useState} from "react";

const columns = [
  { field: "id", headerName: "ID", width: 70, sortable: false },
  {
    field: "creation_time",
    headerName: "Time",
    width: 160,
    valueFormatter: (value) => dayjs(value).format("lll"),
  },
  { field: "username", headerName: "Initiator", width: 120 },
  {
    field: "command",
    headerName: "Type",
    width: 120,
  },
  {
    field: "command_arguments",
    headerName: "Parameters",
    sortable: false,
    minWidth: 300,
  },
  { field: "command_result", headerName: "Result", flex: 1, sortable: false },
];

const AuditLogsTable = ({
  auditLogs,
  page,
  pages,
  pageSize,
  updatePageSize,
  updatePage,
  totalLogs,
  loading
}) => {
  return (
    <DataGrid
      rows={auditLogs}
      columns={columns}
      loading={loading}
      paginationMode={'server'}
      paginationMeta={{
        hasNextPage: (page - 1) < pages,
      }}
      paginationModel={{
        page: page - 1,
        pageSize: pageSize,
      }}
      rowCount={totalLogs}
      onPaginationModelChange={(m) => {
        updatePageSize(m.pageSize);
        updatePage(m.page + 1);
      }}
      autoPageSize={false}
      initialState={{
        pagination: {
          paginationModel: {
            pageSize: 10,
          },
        },
        density: "compact",
      }}
      pageSizeOptions={[10, 25, 50, 100]}
      slots={{ toolbar: GridToolbar }}
      disableRowSelectionOnClick
    />
  );
};

const AuditLog = () => {
  const [auditLogs, setAuditLogs] = useState(new IList());
  const [pages, setPages] = useState(0);
  const [totalLogs, setTotalLogs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [usernames, setUsernames] = useState(new IList());
  const [commands, setCommands] = useState(new IList());
  const [usernameSearch, setUsernameSearch] = useState([]);
  const [commandSearch, setCommandSearch] = useState([]);
  const [paramSearch, setParamSearch] = useState("");
  const [timeSort, setTimeSort] = useState("desc");

  const getAuditLogs = () => {
    setIsLoading(true);
    get(
      "get_audit_logs?" +
        new URLSearchParams({
          usernames: usernameSearch,
          commands: commandSearch,
          parameters: paramSearch,
          time_sort: timeSort,
          page: currentPage,
          page_size: pageSize,
        })
    )
      .then((res) => showResponse(res, "get_audit_logs", false))
      .then((res) => {
        setAuditLogs(fromJS(res.result.audit_logs));
        setPages(res.result.total_pages);
        setTotalLogs(res.result.total_entries);
        setIsLoading(false);
      });
  };

  const getMetdata = () => {
    get("get_audit_logs_autocomplete")
      .then((res) => res.json())
      .then((res) => {
        if (res) {
          if (res.result?.usernames) {
            setUsernames(fromJS(res.result.usernames));
          }
          if (res.result?.commands) {
            setCommands(fromJS(res.result.commands));
          }
        }
      })
      .catch(handle_http_errors);
  };

  useEffect(() => {
    getMetdata();
    getAuditLogs();
  }, [pageSize, currentPage]);

  return (
    <Grid container spacing={2} justifyContent="flex-start" alignItems="center">
      <Grid size={3}>
        <Autocomplete
          multiple
          clearOnEscape
          id="tags-outlined"
          options={usernames.toJS()}
          value={usernameSearch}
          filterSelectedOptions
          onChange={(e, val) => {
            setUsernameSearch(val);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="Search for usernames"
              fullWidth
            />
          )}
        />
      </Grid>
      <Grid size={3}>
        <Autocomplete
          multiple
          clearOnEscape
          options={commands.toJS()}
          value={commandSearch}
          filterSelectedOptions
          onChange={(e, val) => {
            setCommandSearch(val);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="Search for commands"
              fullWidth
            />
          )}
        />
      </Grid>
      <Grid>
        <TextField
          label="Parameters search"
          value={paramSearch}
          onChange={(e) => setParamSearch(e.target.value)}
        />
      </Grid>
      <Grid>
        <FormControl>
          <InputLabel htmlFor="age-native-simple">Time sort</InputLabel>
          <Select
            native
            value={timeSort}
            onChange={(e) => setTimeSort(e.target.value)}
            inputProps={{
              name: "age",
              id: "age-native-simple",
            }}
          >
            <option value={"asc"}>Asc</option>
            <option value={"desc"}>Desc</option>
          </Select>
        </FormControl>
      </Grid>
      <Grid>
        <Button variant="contained" onClick={() => {
          setCurrentPage(1);
          setPages(0);
          setTotalLogs(0);
        }}>
          Search
        </Button>
      </Grid>
      <Grid size={12}>
        <AuditLogsTable
          auditLogs={auditLogs.toJS()}
          page={currentPage}
          loading={isLoading}
          pages={pages}
          totalLogs={totalLogs}
          pageSize={pageSize}
          updatePage={(p) => {
            setCurrentPage(p);
          }}
          updatePageSize={(ps) => {
            setPageSize(ps);
          }}
        />
      </Grid>
    </Grid>
  );
};

export default AuditLog;
