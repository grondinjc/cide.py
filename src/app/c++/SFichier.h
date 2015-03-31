/****************************************************************************
 *  Classe:       SFichier                                                  *
 *  Auteur:       Mariane Maynard                                           *
 *  Description:  Representation d'un fichier ouvert sur le serveur         *
 ****************************************************************************/

#ifndef SFICHIER
#define SFICHIER

#include <string>
#include <iostream>
#include <fstream>
#include "Fichier.h"
#include "Types.h"

using std::string;
using std::ifstream;
using std::ofstream;
using std::cout;
using std::endl;
using std::ios;
using std::to_string;
using namespace types;

template <>
  class FichierType<string>
  {
    private:
      string _contenu;
      vers_t _version;
      string _nomFichier;

    public:
      FichierType() = default;

      FichierType(const string &contenu)
        : _contenu(contenu)
        , _version{}
        , _nomFichier{}
      {}

      //premiere ebauche de lecture d'un fichier
      FichierType(const string &nomFichier, const string &contenu)
        : _contenu{contenu}
        , _version{}
        , _nomFichier{nomFichier}
        {
          ifstream fichier(nomFichier);
          if(fichier.is_open())
          {
            fichier >> _contenu;
            fichier.close();
          }
        }

      ~FichierType() = default;

      //premiere ebauche d'ecrireSurDisque
      void ecrireSurDisque()
      {
        string nomVersion = _nomFichier + to_string(_version);
        ofstream fichier (nomVersion);
        if (fichier.is_open())
        {
          fichier << _contenu;
          fichier.close();
          ++_version;
        }
      }

      void inserer(const char *data, pos_t position, size_t taille)
      {_contenu.insert(position, data, taille);}

      void supprimer(pos_t position, size_t taille)
      {_contenu.erase(position, taille);}

      void printContenu()
      {cout << _contenu << endl;}

      string getContenu() const {return _contenu;}
      vers_t getVersion() const {return _version;}
  };

#endif //SFICHIER

//c++ -pthread -fexceptions -O2 -I/usr/local/include/stlport -std=c++11 -c -o Fichier.o ./src/app/c++/Fichier.h
//c++ -pthread -fexceptions -O2 -I/usr/local/include/stlport -o Fichier Fichier.o -lstlport

//g++ -I/usr/local/include/stlport -std=c++11 -c -o Fichier.o Fichier.cpp
//g++ -pthread -I/usr/local/include/stlport -o Fichier Fichier.o -lstlport
