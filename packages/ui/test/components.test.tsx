import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "../src/components/button";
import { StatusBadge } from "../src/components/status-badge";
import { DataTable, type DataTableColumn } from "../src/components/data-table";
import { Modal } from "../src/components/modal";
import { cn } from "../src/lib/utils";

interface Row {
  id: string;
  name: string;
  count: number;
}

const rows: Row[] = [
  { id: "1", name: "Alpha", count: 3 },
  { id: "2", name: "Beta", count: 7 },
];

const columns: DataTableColumn<Row>[] = [
  { id: "name", header: "Name", cell: (row) => row.name },
  { id: "count", header: "Count", cell: (row) => row.count },
];

describe("Button", () => {
  it("renders and handles clicks", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);

    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("asChild renders the child element with button styling", () => {
    render(
      <Button asChild variant="outline">
        <a href="/queue">Open queue</a>
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Open queue" });
    expect(link.tagName).toBe("A");
    expect(link.className).toContain("border");
  });
});

describe("StatusBadge", () => {
  it("exposes the label as text content", () => {
    render(<StatusBadge tone="warning" label="Waiting" />);
    expect(screen.getByText("Waiting")).toBeInTheDocument();
  });

  it("hides the state dot when disabled", () => {
    const { container } = render(<StatusBadge tone="success" label="Done" dot={false} />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
  });
});

describe("DataTable", () => {
  it("renders one row per record", () => {
    render(<DataTable columns={columns} rows={rows} rowKey={(row) => row.id} />);

    expect(screen.getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(3); // header + 2 rows
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("shows the empty state", () => {
    render(
      <DataTable
        columns={columns}
        rows={[]}
        rowKey={(row) => row.id}
        empty="Nothing to show"
      />,
    );

    expect(screen.getByText("Nothing to show")).toBeInTheDocument();
  });

  it("shows skeletons while loading", () => {
    const { container } = render(
      <DataTable columns={columns} rows={[]} rowKey={(row) => row.id} isLoading skeletonRows={2} />,
    );

    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(4); // 2 rows x 2 cols
    expect(screen.queryAllByRole("row")).toHaveLength(3);
  });

  it("selects a row by click and by keyboard", async () => {
    const onRowSelect = vi.fn();
    render(
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        onRowSelect={onRowSelect}
      />,
    );

    await userEvent.click(screen.getByText("Alpha"));
    expect(onRowSelect).toHaveBeenCalledWith(rows[0]);

    await userEvent.keyboard("{Enter}");
    expect(onRowSelect).toHaveBeenCalledTimes(2);
  });
});

describe("Modal", () => {
  it("opens from its trigger and closes on escape", async () => {
    render(
      <Modal title="Create ticket" trigger={<Button>New ticket</Button>} description="Details">
        <p>Form body</p>
      </Modal>,
    );

    await userEvent.click(screen.getByRole("button", { name: "New ticket" }));
    expect(screen.getByRole("dialog", { name: "Create ticket" })).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("supports controlled usage", async () => {
    const onOpenChange = vi.fn();
    render(
      <Modal title="Confirm" open onOpenChange={onOpenChange}>
        <p>Are you sure?</p>
      </Modal>,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("cn", () => {
  it("merges conflicting tailwind classes with the last one winning", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });
});
