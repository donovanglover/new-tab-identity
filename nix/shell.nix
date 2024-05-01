{ pkgs, ... }:

{
  nativeBuildInputs = with pkgs; [
    firefox
    nodejs
    nodePackages.npm
  ];
}
