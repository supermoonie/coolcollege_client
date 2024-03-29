package com.github.supermoonie.coolcollege.utils;

import javax.swing.*;
import java.awt.*;
import java.awt.datatransfer.*;
import java.io.File;
import java.io.IOException;
import java.util.List;

/**
 * @author supermoonie
 * @since 2020/8/22
 */
public class ClipboardUtil {

    private ClipboardUtil() {

    }

    public static String readString() throws IOException, UnsupportedFlavorException {
        Clipboard systemClipboard = Toolkit.getDefaultToolkit().getSystemClipboard();
        return systemClipboard.getData(DataFlavor.stringFlavor).toString();
    }

    public static void copyImage(Image image) {
        Clipboard systemClipboard = Toolkit.getDefaultToolkit().getSystemClipboard();
        systemClipboard.setContents(new ImageTransferable(image), null);
    }

    public static void copyFile(List<File> files) {
        Clipboard systemClipboard = Toolkit.getDefaultToolkit().getSystemClipboard();
        systemClipboard.setContents(new FileTransferable(files), null);
    }

    public static void copyText(String text) {
        Clipboard systemClipboard = Toolkit.getDefaultToolkit().getSystemClipboard();
        systemClipboard.setContents(new StringSelection(text), null);
    }

    public static void copySelectedCell(JTable table) {
        int[] selectedRows = table.getSelectedRows();
        int[] selectedColumns = table.getSelectedColumns();
        if (null == selectedRows || 0 == selectedRows.length
                || null == selectedColumns || 0 == selectedColumns.length) {
            return;
        }
        StringBuilder selected = new StringBuilder();
        for (int row : selectedRows) {
            for (int col : selectedColumns) {
                Object value = table.getValueAt(row, col);
                if (null != value) {
                    selected.append(value.toString()).append(" ");
                }
            }
            selected.append("\n");
        }
        copyText(selected.toString());
    }

    public static void copySelectedRow(JTable table) {
        int[] selectedRows = table.getSelectedRows();
        if (null == selectedRows || 0 == selectedRows.length) {
            return;
        }
        StringBuilder selected = new StringBuilder();
        for (int row : selectedRows) {
            Object name = table.getValueAt(row, 0);
            Object value = table.getValueAt(row, 1);
            if (null != name && null != value) {
                selected.append(name.toString()).append(": ").append(value.toString()).append("\n");
            }
        }
        copyText(selected.toString());
    }

    private static class ImageTransferable implements Transferable {

        Image i;

        public ImageTransferable(Image i) {
            this.i = i;
        }

        @Override
        public Object getTransferData(DataFlavor flavor)
                throws UnsupportedFlavorException {
            if (flavor.equals(DataFlavor.imageFlavor) && i != null) {
                return i;
            } else {
                throw new UnsupportedFlavorException(flavor);
            }
        }

        @Override
        public DataFlavor[] getTransferDataFlavors() {
            DataFlavor[] flavors = new DataFlavor[1];
            flavors[0] = DataFlavor.imageFlavor;
            return flavors;
        }

        @Override
        public boolean isDataFlavorSupported(DataFlavor flavor) {
            DataFlavor[] flavors = getTransferDataFlavors();
            for (DataFlavor dataFlavor : flavors) {
                if (flavor.equals(dataFlavor)) {
                    return true;
                }
            }
            return false;
        }
    }

    private static class FileTransferable implements Transferable {

        private final List<File> listOfFiles;

        public FileTransferable(List<File> files) {
            this.listOfFiles = files;
        }

        @Override
        public DataFlavor[] getTransferDataFlavors() {
            return new DataFlavor[]{DataFlavor.javaFileListFlavor};
        }

        @Override
        public boolean isDataFlavorSupported(DataFlavor flavor) {
            return DataFlavor.javaFileListFlavor.equals(flavor);
        }

        @Override
        public Object getTransferData(DataFlavor flavor) {
            return listOfFiles;
        }
    }
}
