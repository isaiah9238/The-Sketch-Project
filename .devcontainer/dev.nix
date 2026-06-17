{ pkgs, ...}: {
    packages = [
        pkgs.nodesjs_22
        pkgs.pnpm
        pkgs.gcc
        pkgs.gnumake
        pkgs.vim
    ];
    env = {
        EDITOR = "vim";
    };
}