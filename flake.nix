{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { nixpkgs, ... }: let
    inherit (nixpkgs.legacyPackages.${system}) pkgs;
    inherit (pkgs) mkShell;
    inherit (builtins) attrValues;

    system = "x86_64-linux";
  in {
    devShell.${system} = mkShell {
      nativeBuildInputs = attrValues {
        inherit (pkgs) firefox nodejs;
      };
    };
  };
}
