import * as React from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const ITEM_HEIGHT = 40;

type Props = {
  onDelete: () => void;
  onUpdate?: () => void;
};

export default function LongMenu({ onDelete, onUpdate }: Props) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    console.log("longmenu clicked!");
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (event: React.MouseEvent<HTMLElement>) => {
    event?.stopPropagation();
    setAnchorEl(null);
  };

  return (
    <div className="text-slate-600 dark:text-white">
      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls={open ? "long-menu" : undefined}
        aria-expanded={open ? "true" : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        sx={{ color: "inherit" }}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            style: {
              maxHeight: ITEM_HEIGHT * 2.5,
              width: "12ch",
            },
          },
          list: {
            "aria-labelledby": "long-button",
          },
        }}
      >
        {/* uncomment this if you want to map dyamically the menu's name  */}
        {/* {options.map((option) => (
          <MenuItem
            key={option}
            selected={option === "Pyxis"}
            onClick={handleClose}
          >
            {option}
          </MenuItem>
          
        ))} */}

        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            handleClose(e);
            onUpdate?.();
          }}
        >
          Edit
        </MenuItem>

        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            handleClose(e);
            onDelete();
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    </div>
  );
}
